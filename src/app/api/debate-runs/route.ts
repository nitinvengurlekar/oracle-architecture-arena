import { listDebateRuns } from "@/lib/db/debate-runs"

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
  const result = await listDebateRuns({ useCaseId, limit })

  return Response.json(result)
}
