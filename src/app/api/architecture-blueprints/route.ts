import { architectureBlueprintGenerateRequestSchema } from "@/lib/architecture-blueprint-contract"
import {
  generateAndSaveArchitectureBlueprint,
  listArchitectureBlueprints,
} from "@/lib/db/architecture-blueprints"
import {
  describePersistenceError,
  isPersistenceUnavailable,
} from "@/lib/db/use-cases"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  const url = new URL(request.url)
  const useCaseId = url.searchParams.get("useCaseId")?.trim() || undefined
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 50
  const result = await listArchitectureBlueprints({ useCaseId, limit })

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

  const parsed = architectureBlueprintGenerateRequestSchema.safeParse(payload)

  if (parsed.success === false) {
    return Response.json(
      {
        error: "Invalid architecture blueprint request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const result = await generateAndSaveArchitectureBlueprint(parsed.data.useCaseId)

    return Response.json(result, { status: 201 })
  } catch (error) {
    if (isPersistenceUnavailable(error)) {
      return Response.json(
        {
          error: describePersistenceError(error),
          fallbackToLocal: true,
        },
        { status: 503 }
      )
    }

    if (error instanceof Error && error.message === "Use case not found.") {
      return Response.json({ error: error.message }, { status: 404 })
    }

    return Response.json(
      { error: "Unable to generate architecture blueprint." },
      { status: 500 }
    )
  }
}
