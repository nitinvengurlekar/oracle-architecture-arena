import { z } from "zod"

import { competitiveAssistBriefSchema } from "@/lib/competitive-assist-contract"

export const debateArenaInputSchema = z.object({
  scenario: z.string().trim().min(1),
  customerContext: z.string().trim().min(1),
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
  assistBrief: competitiveAssistBriefSchema.optional(),
})

const stringArraySchema = z.array(z.string().trim().min(1))
const toneSchema = z.enum(["blue", "emerald", "amber", "red", "slate", "violet"])

const debateAgentPanelSchema = z
  .object({
    id: z.string().trim().min(1),
    role: z.enum(["oracle", "competitor", "judge"]),
    name: z.string().trim().min(1),
    title: z.string().trim().min(1),
    organization: z.string().trim().min(1),
    objective: z.string().trim().min(1),
    response: z.string().trim().min(1),
    keyClaims: stringArraySchema,
    watchItems: stringArraySchema,
    confidence: z.number().min(0).max(100),
    tone: toneSchema,
  })
  .strict()

export const architectureDebateSchema = z
  .object({
    scenario: z.string().trim().min(1),
    customerContext: z.string().trim().min(1),
    agents: z
      .object({
        oracle: debateAgentPanelSchema.extend({ role: z.literal("oracle") }),
        competitor: debateAgentPanelSchema.extend({
          role: z.literal("competitor"),
        }),
        judge: debateAgentPanelSchema.extend({ role: z.literal("judge") }),
      })
      .strict(),
    scores: z.array(
      z
        .object({
          criterion: z.string().trim().min(1),
          oracleScore: z.number().min(0).max(100),
          competitorScore: z.number().min(0).max(100),
          judgeWeight: z.number().min(1).max(100),
          rationale: z.string().trim().min(1),
        })
        .strict()
    ),
    recommendation: z
      .object({
        verdict: z.string().trim().min(1),
        summary: z.string().trim().min(1),
        recommendedArchitecture: z.string().trim().min(1),
        whyOracle: stringArraySchema,
        risksToResolve: stringArraySchema,
        nextSteps: stringArraySchema,
      })
      .strict(),
  })
  .strict()

const agentPanelJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "role",
    "name",
    "title",
    "organization",
    "objective",
    "response",
    "keyClaims",
    "watchItems",
    "confidence",
    "tone",
  ],
  properties: {
    id: { type: "string" },
    role: { type: "string", enum: ["oracle", "competitor", "judge"] },
    name: { type: "string" },
    title: { type: "string" },
    organization: { type: "string" },
    objective: { type: "string" },
    response: { type: "string" },
    keyClaims: { type: "array", items: { type: "string" } },
    watchItems: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 100 },
    tone: {
      type: "string",
      enum: ["blue", "emerald", "amber", "red", "slate", "violet"],
    },
  },
} as const

export const architectureDebateJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["scenario", "customerContext", "agents", "scores", "recommendation"],
  properties: {
    scenario: { type: "string" },
    customerContext: { type: "string" },
    agents: {
      type: "object",
      additionalProperties: false,
      required: ["oracle", "competitor", "judge"],
      properties: {
        oracle: {
          ...agentPanelJsonSchema,
          properties: {
            ...agentPanelJsonSchema.properties,
            role: { type: "string", enum: ["oracle"] },
          },
        },
        competitor: {
          ...agentPanelJsonSchema,
          properties: {
            ...agentPanelJsonSchema.properties,
            role: { type: "string", enum: ["competitor"] },
          },
        },
        judge: {
          ...agentPanelJsonSchema,
          properties: {
            ...agentPanelJsonSchema.properties,
            role: { type: "string", enum: ["judge"] },
          },
        },
      },
    },
    scores: {
      type: "array",
      minItems: 4,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "criterion",
          "oracleScore",
          "competitorScore",
          "judgeWeight",
          "rationale",
        ],
        properties: {
          criterion: { type: "string" },
          oracleScore: { type: "number", minimum: 0, maximum: 100 },
          competitorScore: { type: "number", minimum: 0, maximum: 100 },
          judgeWeight: { type: "number", minimum: 1, maximum: 100 },
          rationale: { type: "string" },
        },
      },
    },
    recommendation: {
      type: "object",
      additionalProperties: false,
      required: [
        "verdict",
        "summary",
        "recommendedArchitecture",
        "whyOracle",
        "risksToResolve",
        "nextSteps",
      ],
      properties: {
        verdict: { type: "string" },
        summary: { type: "string" },
        recommendedArchitecture: { type: "string" },
        whyOracle: { type: "array", items: { type: "string" } },
        risksToResolve: { type: "array", items: { type: "string" } },
        nextSteps: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const
