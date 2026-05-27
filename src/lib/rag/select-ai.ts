import "server-only"

import oracledb from "oracledb"

import { withOracleConnection } from "@/lib/db/oracle"
import type {
  CompetitiveAssistInput,
  RagReference,
  RagSourceType,
  StrategyDomain,
} from "@/types/workbench"

type KnowledgeLayer = "legacy" | "oracle-public" | "oracle-private" | "scenario"
type Classification = "public" | "internal" | "confidential" | "restricted"

type SelectAiVectorIndexRow = {
  ID: string
  INDEX_NAME: string
  DISPLAY_NAME: string
  PROFILE_NAME: string
  KNOWLEDGE_LAYER: KnowledgeLayer
  SOURCE_TYPE: RagSourceType
  STRATEGY_DOMAIN?: StrategyDomain | "cross-domain" | null
  COMPETITOR?: CompetitiveAssistInput["competitor"] | null
  CLASSIFICATION: Classification
  MATCH_LIMIT?: number | null
}

type SelectAiResponseRow = {
  RESPONSE?: string | null
}

const DEFAULT_RAG_LIMIT = 5

export async function searchSelectAiRagContext(
  input: CompetitiveAssistInput,
  limit = DEFAULT_RAG_LIMIT
): Promise<RagReference[]> {
  if (!isSelectAiRagEnabled()) {
    return []
  }

  const indexes = await listEligibleVectorIndexes(input, limit)

  if (indexes.length === 0) {
    return []
  }

  const references: RagReference[] = []

  for (const index of indexes) {
    const excerpt = await narrateFromVectorIndex(index, input)

    if (!excerpt) {
      continue
    }

    references.push({
      id: `select-ai:${index.INDEX_NAME}`,
      title: index.DISPLAY_NAME,
      sourceType: index.SOURCE_TYPE,
      excerpt,
      score: scoreVectorIndex(index, input),
      retrievedFrom: "select-ai-rag",
      knowledgeLayer: index.KNOWLEDGE_LAYER,
      classification: index.CLASSIFICATION,
      vectorIndexName: index.INDEX_NAME,
    })
  }

  return references.slice(0, limit)
}

async function listEligibleVectorIndexes(
  input: CompetitiveAssistInput,
  limit: number
) {
  try {
    const registryIndexes = await listRegistryVectorIndexes(input, limit)

    if (registryIndexes.length > 0) {
      return registryIndexes
    }
  } catch (error) {
    if (!isMissingRegistryTableError(error)) {
      throw error
    }
  }

  return [getConfiguredPrivateVectorIndex()]
}

function getConfiguredPrivateVectorIndex(): SelectAiVectorIndexRow {
  return {
    ID: "configured-oracle-private-rag",
    INDEX_NAME:
      process.env.SELECT_AI_VECTOR_INDEX_NAME?.trim() ||
      "OAA_ORACLE_PRIVATE_RAG_IDX",
    DISPLAY_NAME:
      process.env.SELECT_AI_VECTOR_INDEX_DISPLAY_NAME?.trim() ||
      "Oracle private field knowledge",
    PROFILE_NAME:
      process.env.SELECT_AI_PROFILE_NAME?.trim() || "SEAssist_RAG_PROFILE",
    KNOWLEDGE_LAYER: "oracle-private",
    SOURCE_TYPE: "architecture-pattern",
    CLASSIFICATION: "internal",
    MATCH_LIMIT: readOptionalNumberEnv("SELECT_AI_VECTOR_MATCH_LIMIT"),
  }
}

function readOptionalNumberEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) ? parsed : undefined
}

function isMissingRegistryTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const maybeOracleError = error as { errorNum?: number; message?: string }

  return (
    maybeOracleError.errorNum === 942 ||
    maybeOracleError.message?.includes("ORA-00942") === true
  )
}

async function listRegistryVectorIndexes(
  input: CompetitiveAssistInput,
  limit: number
) {
  return withOracleConnection(async (connection) => {
    const result = await connection.execute<SelectAiVectorIndexRow>(
      `select
        id,
        index_name,
        display_name,
        profile_name,
        knowledge_layer,
        source_type,
        strategy_domain,
        competitor,
        classification,
        match_limit
      from oaa_rag_vector_indexes
      where status = 'active'
        and knowledge_layer = 'oracle-private'
        and classification = 'internal'
        and (strategy_domain = :strategyDomain or strategy_domain = 'cross-domain' or strategy_domain is null)
        and (competitor = :competitor or competitor is null)
      order by
        case when strategy_domain = :strategyDomain then 0 else 1 end,
        case when competitor = :competitor then 0 else 1 end,
        display_name`,
      {
        strategyDomain: input.domain,
        competitor: input.competitor,
      }
    )

    return (result.rows ?? []).slice(0, Math.max(1, limit))
  })
}

async function narrateFromVectorIndex(
  index: SelectAiVectorIndexRow,
  input: CompetitiveAssistInput
) {
  const prompt = [
    "Return only concise retrieved context for an Oracle sales engineering assistant.",
    "Focus on factual product, architecture, competitive, sovereignty, and government-sector relevance.",
    "Do not generate a recommendation or sales brief.",
    `Customer signal: ${input.prompt}`,
    `Competitor: ${input.competitor}`,
    `Strategy domain: ${input.domain}`,
    `Discovery confidence: ${input.discoveryConfidence}`,
  ].join("\n")

  const attributes = JSON.stringify({
    vector_index_name: index.INDEX_NAME,
  })

  return withOracleConnection(async (connection) => {
    const result = await connection.execute<SelectAiResponseRow>(
      `select DBMS_CLOUD_AI.GENERATE(
        prompt => :prompt,
        profile_name => :profileName,
        action => 'narrate',
        attributes => :attributes
      ) as response
      from dual`,
      {
        prompt,
        profileName: index.PROFILE_NAME,
        attributes,
      },
      {
        fetchInfo: {
          RESPONSE: { type: oracledb.STRING },
        },
      }
    )

    return normalizeSelectAiExcerpt(result.rows?.[0]?.RESPONSE)
  })
}

function isSelectAiRagEnabled() {
  return process.env.SELECT_AI_RAG_ENABLED?.trim().toLowerCase() === "true"
}

function scoreVectorIndex(
  index: SelectAiVectorIndexRow,
  input: CompetitiveAssistInput
) {
  let score = 75

  if (index.STRATEGY_DOMAIN === input.domain) {
    score += 12
  }

  if (index.COMPETITOR === input.competitor) {
    score += 8
  }

  if (index.KNOWLEDGE_LAYER === "oracle-private") {
    score += 3
  }

  return score
}

function normalizeSelectAiExcerpt(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const trimmed = value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.length > 1800 ? `${trimmed.slice(0, 1797)}...` : trimmed
}
