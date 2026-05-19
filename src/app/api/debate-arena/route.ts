import { debateArenaInputSchema } from "@/lib/debate-arena-contract"
import { saveDebateRun } from "@/lib/db/debate-runs"
import {
  describePersistenceError,
  isPersistenceUnavailable,
} from "@/lib/db/use-cases"
import { generateDebateArenaWithLlm } from "@/lib/openai-debate-arena"

export const runtime = "nodejs"
export const maxDuration = 180

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

  const parsed = debateArenaInputSchema.safeParse(payload)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid Debate Arena input.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const result = await generateDebateArenaWithLlm(parsed.data)

  if (!parsed.data.useCaseId) {
    return Response.json(result)
  }

  try {
    const savedRun = await saveDebateRun({
      useCaseId: parsed.data.useCaseId,
      input: parsed.data,
      result,
    })

    return Response.json({
      ...result,
      runId: savedRun.id,
      source: savedRun.source,
    })
  } catch (error) {
    if (isPersistenceUnavailable(error)) {
      return Response.json({
        ...result,
        warning: result.warning
          ? `${result.warning} ${describePersistenceError(error)}`
          : describePersistenceError(error),
      })
    }

    throw error
  }
}
