import {
  competitiveAssistBriefSchema,
  competitiveAssistJsonSchema,
} from "@/lib/competitive-assist-contract"
import { generateCompetitiveAssistBrief } from "@/lib/competitive-assist"
import { retrieveCompetitiveAssistRagContext } from "@/lib/rag/retrieve"
import type {
  CompetitiveAssistGenerationResult,
  CompetitiveAssistInput,
} from "@/types/workbench"

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_MODEL = "gpt-5.4-mini"

export async function generateCompetitiveAssistWithLlm(
  input: CompetitiveAssistInput
): Promise<CompetitiveAssistGenerationResult> {
  const ragContext = await retrieveCompetitiveAssistRagContext(input)
  const fallbackBrief = generateCompetitiveAssistBrief(input)
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL

  if (!apiKey) {
    return {
      brief: fallbackBrief,
      mode: "mock",
      model,
      ragContext,
      warning:
        "OpenAI is not configured yet. Add OPENAI_API_KEY to .env.local and restart the dev server to generate live assists.",
    }
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "developer",
            content:
              "You are Competitive SE Assist for Oracle solution architects. Generate concise, field-ready guidance from incomplete customer signals. Never invent customer facts; mark likely priorities as hypotheses. Acknowledge competitor strengths honestly. Use the retrieved context when relevant, and keep the handoff useful for Debate Arena and Architecture Generator.",
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                task: "Create a Competitive SE Assist brief as structured JSON.",
                input,
                retrievedContext: ragContext,
                style:
                  "Enterprise field enablement console. Crisp, specific, and usable in a sales engineering prep call.",
              },
              null,
              2
            ),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "competitive_assist_brief",
            strict: true,
            schema: competitiveAssistJsonSchema,
          },
        },
      }),
    })

    if (!response.ok) {
      return {
        brief: fallbackBrief,
        mode: "mock",
        model,
        ragContext,
        warning: `OpenAI request failed (${response.status}). Using the local fallback assist.`,
      }
    }

    const payload = await response.json()
    const outputText = extractOutputText(payload)

    if (!outputText) {
      return {
        brief: fallbackBrief,
        mode: "mock",
        model,
        ragContext,
        warning:
          "OpenAI returned no structured text. Using the local fallback assist.",
      }
    }

    const parsed = competitiveAssistBriefSchema.parse(JSON.parse(outputText))

    return {
      brief: parsed,
      mode: "llm",
      model,
      ragContext,
    }
  } catch {
    return {
      brief: fallbackBrief,
      mode: "mock",
      model,
      ragContext,
      warning:
        "The live OpenAI generation path hit an error. Using the local fallback assist.",
    }
  }
}

function extractOutputText(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined
  }

  if (typeof payload.output_text === "string") {
    return payload.output_text
  }

  if (!Array.isArray(payload.output)) {
    return undefined
  }

  for (const outputItem of payload.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) {
      continue
    }

    for (const contentItem of outputItem.content) {
      if (
        isRecord(contentItem) &&
        contentItem.type === "output_text" &&
        typeof contentItem.text === "string"
      ) {
        return contentItem.text
      }
    }
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
