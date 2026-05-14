import { z } from "zod"

import {
  competitiveAssistBriefSchema,
  competitiveAssistInputSchema,
} from "@/lib/competitive-assist-contract"

export const ragReferenceSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    sourceType: z.enum([
      "oracle-capability",
      "competitive-context",
      "architecture-pattern",
      "governance-pattern",
    ]),
    excerpt: z.string().trim().min(1),
    score: z.number(),
  })
  .strict()

export const competitiveAssistGenerationResultSchema = z
  .object({
    brief: competitiveAssistBriefSchema,
    mode: z.enum(["llm", "mock"]),
    model: z.string().trim().min(1).optional(),
    ragContext: z.array(ragReferenceSchema),
    warning: z.string().trim().min(1).optional(),
  })
  .strict()

export const saveUseCaseRequestSchema = z
  .object({
    existingId: z.string().trim().min(1).optional(),
    input: competitiveAssistInputSchema,
    result: competitiveAssistGenerationResultSchema,
  })
  .strict()

export type SaveUseCaseRequest = z.infer<typeof saveUseCaseRequestSchema>
