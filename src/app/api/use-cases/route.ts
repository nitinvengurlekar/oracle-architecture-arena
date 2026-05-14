import {
  describePersistenceError,
  isPersistenceUnavailable,
  listUseCases,
  saveUseCase,
} from "@/lib/db/use-cases"
import { saveUseCaseRequestSchema } from "@/lib/use-case-contract"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 50
  const result = await listUseCases(limit)

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

  const parsed = saveUseCaseRequestSchema.safeParse(payload)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid use case payload.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const result = await saveUseCase(parsed.data)

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

    return Response.json(
      {
        error: "Unable to save use case.",
      },
      { status: 500 }
    )
  }
}
