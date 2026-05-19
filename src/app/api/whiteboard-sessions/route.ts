import {
  listWhiteboardSessions,
  saveWhiteboardSession,
} from "@/lib/db/whiteboard-sessions"
import {
  describePersistenceError,
  isPersistenceUnavailable,
} from "@/lib/db/use-cases"
import { whiteboardSessionSaveRequestSchema } from "@/lib/whiteboard-session-contract"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const useCaseId = url.searchParams.get("useCaseId")?.trim() || undefined
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 50
  const result = await listWhiteboardSessions({ useCaseId, limit })

  return Response.json(result)
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    )
  }

  const parsed = whiteboardSessionSaveRequestSchema.safeParse(payload)

  if (parsed.success === false) {
    return Response.json(
      {
        error: "Invalid whiteboard session request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const result = await saveWhiteboardSession(parsed.data)

    return Response.json(result, { status: 201 })
  } catch (error) {
    if (isPersistenceUnavailable(error)) {
      return Response.json(
        {
          error: describeWhiteboardPersistenceError(error),
          fallbackToLocal: true,
        },
        { status: 503 }
      )
    }

    return Response.json(
      { error: "Unable to save whiteboard session." },
      { status: 500 }
    )
  }
}

function describeWhiteboardPersistenceError(error: unknown) {
  return describePersistenceError(error)
    .replace("use case schema", "whiteboard schema")
    .replace("Use case persistence", "Whiteboard persistence")
}
