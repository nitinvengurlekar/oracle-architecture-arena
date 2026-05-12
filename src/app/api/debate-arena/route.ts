import { debateArenaInputSchema } from "@/lib/debate-arena-contract"
import { generateDebateArenaWithLlm } from "@/lib/openai-debate-arena"

export const runtime = "nodejs"

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

  return Response.json(result)
}
