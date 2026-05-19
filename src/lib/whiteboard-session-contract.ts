import { z } from "zod"

const toneSchema = z.enum(["blue", "emerald", "amber", "red", "slate", "violet"])
const noteCategorySchema = z.enum(["Context", "Assumption", "Risk", "Decision"])

export const whiteboardNoteSchema = z
  .object({
    id: z.string().trim().min(1),
    category: noteCategorySchema,
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    tone: toneSchema,
  })
  .strict()

export const whiteboardSessionSaveRequestSchema = z
  .object({
    existingId: z.string().trim().min(1).optional(),
    useCaseId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).max(240),
    snapshot: z.unknown().nullable().optional(),
    notes: z.array(whiteboardNoteSchema),
  })
  .strict()

export type WhiteboardSessionSaveRequest = z.infer<
  typeof whiteboardSessionSaveRequestSchema
>

export type WhiteboardSessionSummary = {
  id: string
  title: string
  useCaseId?: string
  noteCount: number
  shapeCount: number
  status: "active" | "archived" | "deleted"
  createdAt: string
  updatedAt: string
}

export type WhiteboardSessionDetail = WhiteboardSessionSummary & {
  snapshot: unknown | null
  notes: z.infer<typeof whiteboardNoteSchema>[]
}
