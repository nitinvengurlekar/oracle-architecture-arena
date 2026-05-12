import { architectureDebate } from "@/data/mock-workbench"
import {
  architectureDebateJsonSchema,
  architectureDebateSchema,
} from "@/lib/debate-arena-contract"
import { generateCompetitiveAssistBrief } from "@/lib/competitive-assist"
import { searchRagContext } from "@/lib/rag"
import type {
  ArchitectureDebate,
  DebateArenaGenerationInput,
  DebateArenaGenerationResult,
} from "@/types/workbench"

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const DEFAULT_MODEL = "gpt-5.5"
const DEFAULT_REASONING_EFFORT = "high"

export async function generateDebateArenaWithLlm(
  input: DebateArenaGenerationInput
): Promise<DebateArenaGenerationResult> {
  const ragContext = searchRagContext({
    prompt: input.customerContext,
    competitor: input.competitor,
    domain: input.domain,
    discoveryConfidence: input.discoveryConfidence,
  })
  const fallbackDebate = createFallbackDebate(input)
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_DEBATE_MODEL?.trim() || DEFAULT_MODEL
  const reasoningEffort =
    process.env.OPENAI_DEBATE_REASONING_EFFORT?.trim() ||
    DEFAULT_REASONING_EFFORT

  if (!apiKey) {
    return {
      debate: fallbackDebate,
      mode: "mock",
      model,
      reasoningEffort,
      ragContext,
      warning:
        "OpenAI is not configured yet. Add OPENAI_API_KEY to .env.local and restart the dev server.",
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
        ...(supportsReasoning(model)
          ? { reasoning: { effort: reasoningEffort } }
          : {}),
        input: [
          {
            role: "developer",
            content:
              "You are Debate Arena for Oracle Architecture Arena. Generate an executive architecture debate from the customer context. Be balanced, specific, and field-ready. Do not call content mock. Acknowledge competitor strengths honestly, judge tradeoffs neutrally, and make scores reflect the facts in the input and retrieved context. Use the agent names Oracle Architect Agent, Competitor Architect Agent, and Neutral CTO Judge. Score weights must sum to 100.",
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                task: "Generate Oracle architect, competitor architect, neutral CTO judge, judge-weighted scorecard, and architecture recommendation.",
                selectedCompetitor: input.competitor,
                scenario: input.scenario,
                customerContext: input.customerContext,
                domain: input.domain,
                discoveryConfidence: input.discoveryConfidence,
                competitiveAssist: input.assistBrief,
                retrievedContext: ragContext,
                scoringGuidance:
                  "Use 4 or 5 criteria. Scores must be numeric 0-100. Judge weights must sum to 100. If discovery is sparse, lower confidence and call out unresolved assumptions.",
              },
              null,
              2
            ),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "architecture_debate",
            strict: true,
            schema: architectureDebateJsonSchema,
          },
        },
      }),
    })

    if (!response.ok) {
      return {
        debate: fallbackDebate,
        mode: "mock",
        model,
        reasoningEffort,
        ragContext,
        warning: `OpenAI debate request failed (${response.status}). Using local fallback debate.`,
      }
    }

    const payload = await response.json()
    const outputText = extractOutputText(payload)

    if (!outputText) {
      return {
        debate: fallbackDebate,
        mode: "mock",
        model,
        reasoningEffort,
        ragContext,
        warning:
          "OpenAI returned no structured debate text. Using local fallback debate.",
      }
    }

    const debate = architectureDebateSchema.parse(JSON.parse(outputText))

    return {
      debate,
      mode: "llm",
      model,
      reasoningEffort,
      ragContext,
    }
  } catch {
    return {
      debate: fallbackDebate,
      mode: "mock",
      model,
      reasoningEffort,
      ragContext,
      warning:
        "The live Debate Arena generation path hit an error. Using local fallback debate.",
    }
  }
}

function createFallbackDebate(input: DebateArenaGenerationInput): ArchitectureDebate {
  const assistBrief =
    input.assistBrief ??
    generateCompetitiveAssistBrief({
      prompt: input.customerContext,
      competitor: input.competitor,
      domain: input.domain,
      discoveryConfidence: input.discoveryConfidence,
    })
  const base = architectureDebate

  return {
    ...base,
    scenario: input.scenario,
    customerContext: input.customerContext,
    agents: {
      oracle: {
        ...base.agents.oracle,
        objective:
          "Propose an Oracle-led architecture using the customer context, existing Oracle estate, governance needs, and competitive pressure.",
        response:
          assistBrief.oracleOpportunities.join(" ") ||
          base.agents.oracle.response,
      },
      competitor: {
        ...base.agents.competitor,
        name: `${input.competitor} Architect Agent`,
        title: `${input.competitor} Strategy Advocate`,
        objective: `Represent why ${input.competitor} may be attractive for this customer scenario.`,
        response: assistBrief.competitorStrengths.join(" "),
        keyClaims: assistBrief.competitorStrengths,
        watchItems: assistBrief.competitorRisks,
      },
      judge: {
        ...base.agents.judge,
        objective:
          "Score both approaches against enterprise readiness, architecture risk, governance, and next-step clarity.",
        response:
          "Oracle and the competitor both have credible paths. The stronger recommendation depends on production controls, integration to systems of record, governance obligations, and measurable workload economics.",
        keyClaims: assistBrief.inferredPriorities,
        watchItems: assistBrief.discoveryQuestions,
      },
    },
    scores: base.scores.map((score, index) => ({
      ...score,
      oracleScore: clampScore(score.oracleScore + (index === 0 ? 2 : 0)),
      competitorScore: clampScore(
        score.competitorScore + (input.discoveryConfidence === "Sparse" ? -4 : 2)
      ),
      rationale:
        "Local fallback score based on discovery confidence, Oracle positioning opportunities, and competitor risk profile.",
    })),
    recommendation: {
      ...base.recommendation,
      verdict: `${input.competitor} debate requires workload-specific validation`,
      summary:
        "Use the generated field assist to test competitor strengths against Oracle data gravity, governance, production operations, and measurable economics.",
      recommendedArchitecture: assistBrief.feeds.architectureGenerator,
      whyOracle: assistBrief.oracleOpportunities,
      risksToResolve: assistBrief.competitorRisks,
      nextSteps: assistBrief.recommendedTalkTrack,
    },
  }
}

function supportsReasoning(model: string) {
  return model.startsWith("gpt-5") || model.startsWith("o")
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
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
