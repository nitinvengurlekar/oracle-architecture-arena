import { competitiveAssistInputSchema } from "@/lib/competitive-assist-contract"
import { generateCompetitiveAssistWithLlm } from "@/lib/openai-competitive-assist"

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

  const parsed = competitiveAssistInputSchema.safeParse(payload)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid competitive assist input.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const result = await generateCompetitiveAssistWithLlm(parsed.data)

  return Response.json(result)
}
