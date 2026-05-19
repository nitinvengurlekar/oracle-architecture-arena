import "server-only"

import crypto from "node:crypto"

import oracledb from "oracledb"

import { architectureDebateSchema, debateArenaInputSchema } from "@/lib/debate-arena-contract"
import { isPersistenceUnavailable } from "@/lib/db/use-cases"
import { ragReferenceSchema } from "@/lib/use-case-contract"
import { withOracleConnection } from "@/lib/db/oracle"
import type {
  ArchitectureDebate,
  DebateArenaGenerationInput,
  DebateArenaGenerationResult,
  RagReference,
} from "@/types/workbench"

export type DebateRunItem = {
  id: string
  useCaseId: string
  input: DebateArenaGenerationInput
  debate: ArchitectureDebate
  generation: {
    mode: DebateArenaGenerationResult["mode"]
    model?: string
    reasoningEffort?: string
    warning?: string
  }
  ragContext: RagReference[]
  createdAt: string
}

type DebateRunRow = {
  ID: string
  USE_CASE_ID: string
  INPUT_JSON: unknown
  DEBATE_JSON: unknown
  GENERATION_MODE: "llm" | "mock"
  MODEL?: string | null
  REASONING_EFFORT?: string | null
  RAG_CONTEXT_JSON?: unknown
  CREATED_AT: Date | string
}

export async function listDebateRuns(options: {
  useCaseId?: string
  limit?: number
}) {
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))

  try {
    const items = await withOracleConnection(async (connection) => {
      const whereClause = options.useCaseId ? "where use_case_id = :useCaseId" : ""
      const binds = options.useCaseId
        ? { useCaseId: options.useCaseId, limit }
        : { limit }
      const result = await connection.execute<DebateRunRow>(
        `select
          id,
          use_case_id,
          input_json,
          debate_json,
          generation_mode,
          model,
          reasoning_effort,
          rag_context_json,
          created_at
        from oaa_debate_runs
        ${whereClause}
        order by created_at desc
        fetch first :limit rows only`,
        binds
      )

      return (result.rows ?? []).map(mapDebateRunRow)
    })

    return {
      items,
      source: "database" as const,
    }
  } catch (error) {
    if (!isPersistenceUnavailable(error)) {
      throw error
    }

    return {
      items: [],
      source: "seeded-fallback" as const,
      warning: "Debate run persistence is not available yet.",
    }
  }
}

export async function getLatestDebateRunForUseCase(useCaseId: string) {
  const result = await listDebateRuns({ useCaseId, limit: 1 })

  return result.items[0]
}

export async function saveDebateRun({
  useCaseId,
  input,
  result,
}: {
  useCaseId: string
  input: DebateArenaGenerationInput
  result: DebateArenaGenerationResult
}) {
  return withOracleConnection(async (connection) => {
    const id = crypto.randomUUID()

    await connection.execute(
      `insert into oaa_debate_runs (
        id,
        use_case_id,
        input_json,
        debate_json,
        generation_mode,
        model,
        reasoning_effort,
        rag_context_json,
        created_at
      ) values (
        :id,
        :useCaseId,
        :inputJson,
        :debateJson,
        :generationMode,
        :model,
        :reasoningEffort,
        :ragContextJson,
        systimestamp
      )`,
      {
        id,
        useCaseId,
        inputJson: { type: oracledb.DB_TYPE_JSON, val: input },
        debateJson: { type: oracledb.DB_TYPE_JSON, val: result.debate },
        generationMode: result.mode,
        model: result.model,
        reasoningEffort: result.reasoningEffort,
        ragContextJson: {
          type: oracledb.DB_TYPE_JSON,
          val: result.ragContext,
        },
      }
    )
    await connection.commit()

    return {
      id,
      source: "database" as const,
    }
  })
}

function mapDebateRunRow(row: DebateRunRow): DebateRunItem {
  return {
    id: row.ID,
    useCaseId: row.USE_CASE_ID,
    input: debateArenaInputSchema.parse(parseJson(row.INPUT_JSON)),
    debate: architectureDebateSchema.parse(parseJson(row.DEBATE_JSON)),
    generation: {
      mode: row.GENERATION_MODE,
      model: row.MODEL ?? undefined,
      reasoningEffort: row.REASONING_EFFORT ?? undefined,
    },
    ragContext: ragReferenceSchema.array().parse(parseJson(row.RAG_CONTEXT_JSON) ?? []),
    createdAt: formatDatabaseDate(row.CREATED_AT),
  }
}

function parseJson(value: unknown) {
  return typeof value === "string" ? JSON.parse(value) : value
}

function formatDatabaseDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
