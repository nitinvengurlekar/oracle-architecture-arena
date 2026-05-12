import { z } from "zod"

export const competitiveAssistInputSchema = z.object({
  prompt: z.string().trim().min(1, "Customer signal is required."),
  competitor: z.enum([
    "Databricks",
    "Snowflake",
    "AWS",
    "Azure",
    "Google Cloud",
    "Other",
  ]),
  domain: z.enum([
    "database-modernization",
    "ai-ml-platform",
    "lakehouse-modernization",
    "sovereign-deployment",
  ]),
  discoveryConfidence: z.enum(["Sparse", "Directional", "Validated"]),
})

const stringArraySchema = z.array(z.string().trim().min(1))

export const competitiveAssistBriefSchema = z
  .object({
    prompt: z.string().trim().min(1),
    competitor: competitiveAssistInputSchema.shape.competitor,
    domain: competitiveAssistInputSchema.shape.domain,
    discoveryConfidence: competitiveAssistInputSchema.shape.discoveryConfidence,
    customerSignals: stringArraySchema,
    inferredPriorities: stringArraySchema,
    discoveryQuestions: stringArraySchema,
    oracleOpportunities: stringArraySchema,
    competitorStrengths: stringArraySchema,
    competitorRisks: stringArraySchema,
    recommendedTalkTrack: stringArraySchema,
    battleCardGuidance: stringArraySchema,
    battleCardOutput: z
      .object({
        headline: z.string().trim().min(1),
        customerConcern: z.string().trim().min(1),
        oraclePosition: z.string().trim().min(1),
        landmine: z.string().trim().min(1),
        nextMove: z.string().trim().min(1),
      })
      .strict(),
    feeds: z
      .object({
        debateArena: z.string().trim().min(1),
        architectureGenerator: z.string().trim().min(1),
      })
      .strict(),
  })
  .strict()

export const competitiveAssistJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "prompt",
    "competitor",
    "domain",
    "discoveryConfidence",
    "customerSignals",
    "inferredPriorities",
    "discoveryQuestions",
    "oracleOpportunities",
    "competitorStrengths",
    "competitorRisks",
    "recommendedTalkTrack",
    "battleCardGuidance",
    "battleCardOutput",
    "feeds",
  ],
  properties: {
    prompt: {
      type: "string",
      description: "The original customer signal, cleaned up but not expanded.",
    },
    competitor: {
      type: "string",
      enum: ["Databricks", "Snowflake", "AWS", "Azure", "Google Cloud", "Other"],
    },
    domain: {
      type: "string",
      enum: [
        "database-modernization",
        "ai-ml-platform",
        "lakehouse-modernization",
        "sovereign-deployment",
      ],
    },
    discoveryConfidence: {
      type: "string",
      enum: ["Sparse", "Directional", "Validated"],
    },
    customerSignals: {
      type: "array",
      items: { type: "string" },
      description: "Concise inferred signals from the weak customer input.",
    },
    inferredPriorities: {
      type: "array",
      items: { type: "string" },
      description: "Likely customer priorities expressed as hypotheses.",
    },
    discoveryQuestions: {
      type: "array",
      items: { type: "string" },
      description: "Questions the sales engineer should ask next.",
    },
    oracleOpportunities: {
      type: "array",
      items: { type: "string" },
      description: "Specific Oracle positioning opportunities.",
    },
    competitorStrengths: {
      type: "array",
      items: { type: "string" },
      description: "Credible strengths to acknowledge for the competitor.",
    },
    competitorRisks: {
      type: "array",
      items: { type: "string" },
      description: "Risks or open tradeoffs to qualify without overclaiming.",
    },
    recommendedTalkTrack: {
      type: "array",
      items: { type: "string" },
      description: "Short customer-ready talk track steps.",
    },
    battleCardGuidance: {
      type: "array",
      items: { type: "string" },
      description: "Battle-card style guidance for field use.",
    },
    battleCardOutput: {
      type: "object",
      additionalProperties: false,
      required: [
        "headline",
        "customerConcern",
        "oraclePosition",
        "landmine",
        "nextMove",
      ],
      properties: {
        headline: { type: "string" },
        customerConcern: { type: "string" },
        oraclePosition: { type: "string" },
        landmine: { type: "string" },
        nextMove: { type: "string" },
      },
    },
    feeds: {
      type: "object",
      additionalProperties: false,
      required: ["debateArena", "architectureGenerator"],
      properties: {
        debateArena: { type: "string" },
        architectureGenerator: { type: "string" },
      },
    },
  },
} as const
