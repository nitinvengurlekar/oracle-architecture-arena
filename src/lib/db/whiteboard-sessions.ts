import "server-only"

import crypto from "node:crypto"

import oracledb from "oracledb"

import { withOracleConnection } from "@/lib/db/oracle"
import { isPersistenceUnavailable } from "@/lib/db/use-cases"
import {
  whiteboardNoteSchema,
  type WhiteboardSessionDetail,
  type WhiteboardSessionSaveRequest,
  type WhiteboardSessionSummary,
} from "@/lib/whiteboard-session-contract"

type WhiteboardSessionSource = "database" | "seeded-fallback"

export type WhiteboardSessionListResult = {
  items: WhiteboardSessionSummary[]
  source: WhiteboardSessionSource
  warning?: string
}

export type WhiteboardSessionDetailResult = {
  item: WhiteboardSessionDetail | null
  source: WhiteboardSessionSource
  warning?: string
}

type WhiteboardSessionRow = {
  ID: string
  USE_CASE_ID?: string | null
  TITLE: string
  TLDRAW_SNAPSHOT_JSON?: unknown
  NOTES_JSON?: unknown
  STATUS: "active" | "archived" | "deleted"
  CREATED_AT: Date | string
  UPDATED_AT: Date | string
}

export async function listWhiteboardSessions(options: {
  useCaseId?: string
  limit?: number
}): Promise<WhiteboardSessionListResult> {
  const limit = Math.min(100, Math.max(1, options.limit ?? 50))

  try {
    const items = await withOracleConnection(async (connection) => {
      const whereClause = options.useCaseId
        ? "where use_case_id = :useCaseId and status = 'active'"
        : "where status = 'active'"
      const binds = options.useCaseId
        ? { useCaseId: options.useCaseId, limit }
        : { limit }
      const result = await connection.execute<WhiteboardSessionRow>(
        `select
          id,
          use_case_id,
          title,
          tldraw_snapshot_json,
          notes_json,
          status,
          created_at,
          updated_at
        from oaa_whiteboard_sessions
        ${whereClause}
        order by updated_at desc
        fetch first :limit rows only`,
        binds
      )

      return (result.rows ?? []).map(mapWhiteboardSummaryRow)
    })

    return {
      items,
      source: "database",
    }
  } catch (error) {
    if (!isPersistenceUnavailable(error)) {
      throw error
    }

    return {
      items: [],
      source: "seeded-fallback",
      warning: "Whiteboard persistence is not available yet.",
    }
  }
}

export async function getWhiteboardSessionById(
  id: string
): Promise<WhiteboardSessionDetailResult> {
  try {
    const item = await withOracleConnection((connection) =>
      readWhiteboardSessionById(connection, id)
    )

    return {
      item,
      source: "database",
    }
  } catch (error) {
    if (!isPersistenceUnavailable(error)) {
      throw error
    }

    return {
      item: null,
      source: "seeded-fallback",
      warning: "Whiteboard persistence is not available yet.",
    }
  }
}

export async function saveWhiteboardSession(
  request: WhiteboardSessionSaveRequest
): Promise<{ item: WhiteboardSessionDetail; source: "database" }> {
  return withOracleConnection(async (connection) => {
    const id = request.existingId ?? crypto.randomUUID()

    try {
      await connection.execute(
        `merge into oaa_whiteboard_sessions target
        using (select :id as id from dual) source
          on (target.id = source.id)
        when matched then update set
          target.use_case_id = :useCaseId,
          target.title = :title,
          target.tldraw_snapshot_json = :snapshotJson,
          target.notes_json = :notesJson,
          target.status = 'active',
          target.updated_at = systimestamp
        when not matched then insert (
          id,
          use_case_id,
          title,
          tldraw_snapshot_json,
          notes_json,
          status,
          created_at,
          updated_at
        ) values (
          :id,
          :useCaseId,
          :title,
          :snapshotJson,
          :notesJson,
          'active',
          systimestamp,
          systimestamp
        )`,
        {
          id,
          useCaseId: request.useCaseId ?? null,
          title: request.title,
          snapshotJson: {
            type: oracledb.DB_TYPE_JSON,
            val: request.snapshot ?? null,
          },
          notesJson: {
            type: oracledb.DB_TYPE_JSON,
            val: request.notes,
          },
        }
      )
      const saved = await readWhiteboardSessionById(connection, id)

      if (!saved) {
        throw new Error("Whiteboard session was saved but could not be read.")
      }

      await connection.commit()

      return {
        item: saved,
        source: "database",
      }
    } catch (error) {
      await connection.rollback()
      throw error
    }
  })
}

async function readWhiteboardSessionById(
  connection: oracledb.Connection,
  id: string
) {
  const result = await connection.execute<WhiteboardSessionRow>(
    `select
      id,
      use_case_id,
      title,
      tldraw_snapshot_json,
      notes_json,
      status,
      created_at,
      updated_at
    from oaa_whiteboard_sessions
    where id = :id
      and status = 'active'
    fetch first 1 row only`,
    { id }
  )

  return result.rows?.[0] ? mapWhiteboardDetailRow(result.rows[0]) : null
}

function mapWhiteboardSummaryRow(row: WhiteboardSessionRow): WhiteboardSessionSummary {
  const notes = parseNotes(row.NOTES_JSON)
  const snapshot = parseJson(row.TLDRAW_SNAPSHOT_JSON)

  return {
    id: row.ID,
    title: row.TITLE,
    useCaseId: row.USE_CASE_ID ?? undefined,
    noteCount: notes.length,
    shapeCount: countSnapshotShapes(snapshot),
    status: row.STATUS,
    createdAt: formatDatabaseDate(row.CREATED_AT),
    updatedAt: formatDatabaseDate(row.UPDATED_AT),
  }
}

function mapWhiteboardDetailRow(row: WhiteboardSessionRow): WhiteboardSessionDetail {
  const summary = mapWhiteboardSummaryRow(row)
  const snapshot = parseJson(row.TLDRAW_SNAPSHOT_JSON)

  return {
    ...summary,
    snapshot: snapshot ?? null,
    notes: parseNotes(row.NOTES_JSON),
  }
}

function parseNotes(value: unknown) {
  return whiteboardNoteSchema.array().parse(parseJson(value) ?? [])
}

function parseJson(value: unknown) {
  return typeof value === "string" ? JSON.parse(value) : value
}

function countSnapshotShapes(snapshot: unknown) {
  if (!isRecord(snapshot)) {
    return 0
  }

  const document = snapshot.document

  if (!isRecord(document) || !isRecord(document.store)) {
    return 0
  }

  return Object.values(document.store).filter((record) => {
    return isRecord(record) && record.typeName === "shape"
  }).length
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function formatDatabaseDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
