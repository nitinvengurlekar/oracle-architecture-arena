import "server-only"

import crypto from "node:crypto"

import oracledb from "oracledb"

import { seededUseCaseCatalogItems } from "@/data/smoke-test-fixtures"
import {
  OracleDatabaseConfigurationError,
  withOracleConnection,
} from "@/lib/db/oracle"
import {
  competitiveAssistBriefSchema,
  competitiveAssistInputSchema,
} from "@/lib/competitive-assist-contract"
import {
  ragReferenceSchema,
  type SaveUseCaseRequest,
} from "@/lib/use-case-contract"
import type { UseCaseCatalogItem } from "@/types/workbench"

type CatalogSource = "database" | "seeded-fallback"

export type UseCaseCatalogQueryResult = {
  items: UseCaseCatalogItem[]
  source: CatalogSource
  warning?: string
}

export type UseCaseQueryResult = {
  item: UseCaseCatalogItem | null
  source: CatalogSource
  warning?: string
}

export type SaveUseCaseResult = {
  item: UseCaseCatalogItem
  source: "database"
}

type UseCaseRow = {
  ID: string
  TITLE: string
  CREATED_AT: Date | string
  UPDATED_AT: Date | string
  INPUT_JSON: unknown
  BRIEF_JSON: unknown
  GENERATION_MODE: "llm" | "mock"
  MODEL?: string | null
  WARNING?: string | null
  RAG_CONTEXT_JSON?: unknown
}

export async function listUseCases(
  limit = 50
): Promise<UseCaseCatalogQueryResult> {
  try {
    const items = await withOracleConnection(async (connection) => {
      const result = await connection.execute<UseCaseRow>(
        `select
          uc.id,
          uc.title,
          uc.created_at,
          uc.updated_at,
          ar.input_json,
          ar.brief_json,
          ar.generation_mode,
          ar.model,
          ar.warning,
          ar.rag_context_json
        from oaa_use_cases uc
        join (
          select
            assist_runs.*,
            row_number() over (
              partition by assist_runs.use_case_id
              order by assist_runs.created_at desc
            ) as run_rank
          from oaa_assist_runs assist_runs
        ) ar
          on ar.use_case_id = uc.id
         and ar.run_rank = 1
        where uc.status = 'active'
        order by uc.updated_at desc
        fetch first :limit rows only`,
        { limit }
      )

      return (result.rows ?? []).map(mapUseCaseRow)
    })

    return {
      items,
      source: "database",
    }
  } catch (error) {
    return handleFallbackList(error)
  }
}

export async function getUseCaseById(id: string): Promise<UseCaseQueryResult> {
  try {
    const item = await withOracleConnection(async (connection) => {
      const result = await connection.execute<UseCaseRow>(
        `select
          uc.id,
          uc.title,
          uc.created_at,
          uc.updated_at,
          ar.input_json,
          ar.brief_json,
          ar.generation_mode,
          ar.model,
          ar.warning,
          ar.rag_context_json
        from oaa_use_cases uc
        join (
          select
            assist_runs.*,
            row_number() over (
              partition by assist_runs.use_case_id
              order by assist_runs.created_at desc
            ) as run_rank
          from oaa_assist_runs assist_runs
        ) ar
          on ar.use_case_id = uc.id
         and ar.run_rank = 1
        where uc.id = :id
          and uc.status = 'active'
        fetch first 1 row only`,
        { id }
      )

      return result.rows?.[0] ? mapUseCaseRow(result.rows[0]) : null
    })

    return {
      item,
      source: "database",
    }
  } catch (error) {
    return handleFallbackItem(error, id)
  }
}

export async function saveUseCase({
  existingId,
  input,
  result,
}: SaveUseCaseRequest): Promise<SaveUseCaseResult> {
  return withOracleConnection(async (connection) => {
    const id = existingId ?? crypto.randomUUID()
    const now = new Date().toISOString()
    const title = createUseCaseTitle(input.prompt, input.competitor, input.domain)
    const item: UseCaseCatalogItem = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      input,
      brief: result.brief,
      generation: {
        mode: result.mode,
        model: result.model,
        warning: result.warning,
      },
      ragContext: result.ragContext,
    }

    try {
      await connection.execute(
        `merge into oaa_use_cases target
        using (select :id as id from dual) source
          on (target.id = source.id)
        when matched then update set
          target.title = :title,
          target.competitor = :competitor,
          target.strategy_domain = :strategyDomain,
          target.discovery_confidence = :discoveryConfidence,
          target.raw_customer_signal = :rawCustomerSignal,
          target.updated_at = systimestamp
        when not matched then insert (
          id,
          title,
          competitor,
          strategy_domain,
          discovery_confidence,
          raw_customer_signal,
          status,
          source_type,
          created_at,
          updated_at
        ) values (
          :id,
          :title,
          :competitor,
          :strategyDomain,
          :discoveryConfidence,
          :rawCustomerSignal,
          'active',
          'user',
          systimestamp,
          systimestamp
        )`,
        {
          id,
          title,
          competitor: input.competitor,
          strategyDomain: input.domain,
          discoveryConfidence: input.discoveryConfidence,
          rawCustomerSignal: input.prompt,
        }
      )
      await connection.execute(
        `insert into oaa_assist_runs (
          id,
          use_case_id,
          input_json,
          brief_json,
          generation_mode,
          model,
          warning,
          rag_context_json,
          created_at
        ) values (
          :id,
          :useCaseId,
          :inputJson,
          :briefJson,
          :generationMode,
          :model,
          :warning,
          :ragContextJson,
          systimestamp
        )`,
        {
          id: crypto.randomUUID(),
          useCaseId: id,
          inputJson: { type: oracledb.DB_TYPE_JSON, val: input },
          briefJson: { type: oracledb.DB_TYPE_JSON, val: result.brief },
          generationMode: result.mode,
          model: result.model,
          warning: result.warning,
          ragContextJson: {
            type: oracledb.DB_TYPE_JSON,
            val: result.ragContext,
          },
        }
      )
      await connection.commit()

      return {
        item,
        source: "database",
      }
    } catch (error) {
      await connection.rollback()
      throw error
    }
  })
}

export function isPersistenceUnavailable(error: unknown) {
  return (
    error instanceof OracleDatabaseConfigurationError ||
    isMissingSchemaError(error) ||
    isConnectionUnavailableError(error)
  )
}

export function describePersistenceError(error: unknown) {
  if (error instanceof OracleDatabaseConfigurationError) {
    return "ADB is not configured yet."
  }

  if (isMissingSchemaError(error)) {
    return "ADB is reachable, but the use case schema has not been created yet."
  }

  if (isConnectionUnavailableError(error)) {
    return "ADB connection is not available yet."
  }

  return "Use case persistence failed."
}

function handleFallbackList(error: unknown): UseCaseCatalogQueryResult {
  if (!isPersistenceUnavailable(error)) {
    throw error
  }

  return {
    items: seededUseCaseCatalogItems,
    source: "seeded-fallback",
    warning: describePersistenceError(error),
  }
}

function handleFallbackItem(error: unknown, id: string): UseCaseQueryResult {
  if (!isPersistenceUnavailable(error)) {
    throw error
  }

  return {
    item: seededUseCaseCatalogItems.find((item) => item.id === id) ?? null,
    source: "seeded-fallback",
    warning: describePersistenceError(error),
  }
}

function mapUseCaseRow(row: UseCaseRow): UseCaseCatalogItem {
  const input = competitiveAssistInputSchema.parse(parseJson(row.INPUT_JSON))
  const brief = competitiveAssistBriefSchema.parse(parseJson(row.BRIEF_JSON))
  const ragContext = ragReferenceSchema
    .array()
    .parse(parseJson(row.RAG_CONTEXT_JSON) ?? [])

  return {
    id: row.ID,
    title: row.TITLE,
    createdAt: formatDatabaseDate(row.CREATED_AT),
    updatedAt: formatDatabaseDate(row.UPDATED_AT),
    input,
    brief,
    generation: {
      mode: row.GENERATION_MODE,
      model: row.MODEL ?? undefined,
      warning: row.WARNING ?? undefined,
    },
    ragContext,
  }
}

function parseJson(value: unknown) {
  return typeof value === "string" ? JSON.parse(value) : value
}

function formatDatabaseDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function isMissingSchemaError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "errorNum" in error &&
    error.errorNum === 942
  )
}

function isConnectionUnavailableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("NJS-")
  )
}

function createUseCaseTitle(prompt: string, competitor: string, domain: string) {
  const normalizedPrompt = prompt.trim().replace(/\s+/g, " ")
  const firstSentence = normalizedPrompt.split(/[.!?]/)[0]?.trim()
  const title = firstSentence || `${competitor} ${domain.replaceAll("-", " ")}`

  return title.length > 72 ? `${title.slice(0, 69)}...` : title
}
