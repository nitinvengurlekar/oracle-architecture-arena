import { getWhiteboardSessionById } from "@/lib/db/whiteboard-sessions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const result = await getWhiteboardSessionById(id)

  if (!result.item) {
    return Response.json(
      {
        error: "Whiteboard session not found.",
        source: result.source,
        warning: result.warning,
      },
      { status: 404 }
    )
  }

  return Response.json(result)
}
