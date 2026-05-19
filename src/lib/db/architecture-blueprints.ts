import "server-only"

import crypto from "node:crypto"

import oracledb from "oracledb"

import { createArchitectureBlueprintFromUseCase } from "@/lib/architecture-blueprint-generator"
import { architectureBlueprintPayloadSchema } from "@/lib/architecture-blueprint-contract"
import { getLatestDebateRunForUseCase } from "@/lib/db/debate-runs"
import { getUseCaseById, isPersistenceUnavailable } from "@/lib/db/use-cases"
import { withOracleConnection } from "@/lib/db/oracle"
import type {
  ArchitectureGeneratorBlueprint,
  ArchitectureRecommendation,
} from "@/types/workbench"

export type ArchitectureBlueprintHistoryItem = {
  id: string
  label: string
  description: string
  generatedAt: string
  useCaseId: string
  debateRunId?: string
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
}

type BlueprintRow = {
  ID: string
  USE_CASE_ID: string
  DEBATE_RUN_ID?: string | null
  TITLE: string
  SUMMARY?: string | null
  CONFIDENCE?: number | null
  BLUEPRINT_JSON: unknown
  CREATED_AT: Date | string
  UPDATED_AT: Date | string
}

export async function listArchitectureBlueprints(options: {
  useCaseId?: string
  limit?: number
}) {
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))

  try {
    const items = await withOracleConnection(async (connection) => {
      const whereClause = options.useCaseId
        ? "where use_case_id = :useCaseId and status <> 'retired'"
        : "where status <> 'retired'"
      const binds = options.useCaseId
        ? { useCaseId: options.useCaseId, limit }
        : { limit }
      const result = await connection.execute<BlueprintRow>(
        `select
          id,
          use_case_id,
          debate_run_id,
          title,
          summary,
          confidence,
          blueprint_json,
          created_at,
          updated_at
        from oaa_architecture_blueprints
        ${whereClause}
        order by updated_at desc
        fetch first :limit rows only`,
        binds
      )

      return (result.rows ?? []).map(mapBlueprintRow)
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
      warning: "Architecture blueprint persistence is not available yet.",
    }
  }
}

export async function generateAndSaveArchitectureBlueprint(useCaseId: string) {
  const useCaseResult = await getUseCaseById(useCaseId)

  if (!useCaseResult.item) {
    throw new Error("Use case not found.")
  }

  const latestDebate = await getLatestDebateRunForUseCase(useCaseId)
  const payload = createArchitectureBlueprintFromUseCase({
    useCase: useCaseResult.item,
    recommendation: latestDebate?.debate.recommendation,
  })

  return saveArchitectureBlueprint({
    useCaseId,
    debateRunId: latestDebate?.id,
    blueprint: {
      ...payload.blueprint,
      id: crypto.randomUUID(),
    },
    recommendation: payload.recommendation,
  })
}

async function saveArchitectureBlueprint({
  useCaseId,
  debateRunId,
  blueprint,
  recommendation,
}: {
  useCaseId: string
  debateRunId?: string
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
}) {
  return withOracleConnection(async (connection) => {
    const payload = { blueprint, recommendation }

    try {
      await connection.execute(
        `insert into oaa_architecture_blueprints (
          id,
          use_case_id,
          debate_run_id,
          title,
          summary,
          status,
          confidence,
          blueprint_json,
          created_at,
          updated_at
        ) values (
          :id,
          :useCaseId,
          :debateRunId,
          :title,
          :summary,
          'generated',
          :confidence,
          :blueprintJson,
          systimestamp,
          systimestamp
        )`,
        {
          id: blueprint.id,
          useCaseId,
          debateRunId,
          title: blueprint.title,
          summary: blueprint.summary,
          confidence: blueprint.confidence,
          blueprintJson: { type: oracledb.DB_TYPE_JSON, val: payload },
        }
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    }

    return {
      item: {
        id: blueprint.id,
        label: blueprint.title,
        description: blueprint.generatedFrom,
        generatedAt: new Date().toISOString(),
        useCaseId,
        debateRunId,
        blueprint,
        recommendation,
      },
      source: "database" as const,
    }
  })
}

function mapBlueprintRow(row: BlueprintRow): ArchitectureBlueprintHistoryItem {
  const payload = architectureBlueprintPayloadSchema.parse(parseJson(row.BLUEPRINT_JSON))

  return {
    id: row.ID,
    label: row.TITLE,
    description: payload.blueprint.generatedFrom,
    generatedAt: formatDatabaseDate(row.UPDATED_AT),
    useCaseId: row.USE_CASE_ID,
    debateRunId: row.DEBATE_RUN_ID ?? undefined,
    blueprint: payload.blueprint,
    recommendation: payload.recommendation,
  }
}

function parseJson(value: unknown) {
  return typeof value === "string" ? JSON.parse(value) : value
}

function formatDatabaseDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
