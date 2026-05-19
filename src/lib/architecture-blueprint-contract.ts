import { z } from "zod"

const toneSchema = z.enum(["blue", "emerald", "amber", "red", "slate", "violet"])
const nodeStatusSchema = z.enum(["Generated", "Review", "Validated"])

export const architectureGeneratorNodeSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    type: z.enum(["input", "platform", "service", "governance", "output"]),
    detail: z.string().trim().min(1),
    x: z.number(),
    y: z.number(),
    ociService: z.string().trim().min(1),
    layer: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    status: nodeStatusSchema,
    tone: toneSchema,
  })
  .strict()

export const architectureEdgeSchema = z
  .object({
    id: z.string().trim().min(1),
    source: z.string().trim().min(1),
    target: z.string().trim().min(1),
    label: z.string().trim().min(1),
  })
  .strict()

export const architectureGeneratorMetricSchema = z
  .object({
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
    detail: z.string().trim().min(1),
    tone: toneSchema,
  })
  .strict()

export const architectureGeneratorBlueprintSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    generatedFrom: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    recommendationSource: z.string().trim().min(1),
    confidence: z.number().min(0).max(100),
    nodes: z.array(architectureGeneratorNodeSchema).min(1),
    edges: z.array(architectureEdgeSchema),
    metrics: z.array(architectureGeneratorMetricSchema).min(1),
    assumptions: z.array(z.string().trim().min(1)),
  })
  .strict()

export const architectureRecommendationSchema = z
  .object({
    verdict: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    recommendedArchitecture: z.string().trim().min(1),
    whyOracle: z.array(z.string().trim().min(1)),
    risksToResolve: z.array(z.string().trim().min(1)),
    nextSteps: z.array(z.string().trim().min(1)),
  })
  .strict()

export const architectureBlueprintPayloadSchema = z
  .object({
    blueprint: architectureGeneratorBlueprintSchema,
    recommendation: architectureRecommendationSchema,
  })
  .strict()

export const architectureBlueprintGenerateRequestSchema = z
  .object({
    useCaseId: z.string().trim().min(1),
  })
  .strict()
