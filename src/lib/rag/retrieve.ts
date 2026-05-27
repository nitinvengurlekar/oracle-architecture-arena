import "server-only"

import { searchRagContext } from "@/lib/rag"
import { searchSelectAiRagContext } from "@/lib/rag/select-ai"
import type {
  CompetitiveAssistInput,
  RagReference,
} from "@/types/workbench"

export async function retrieveCompetitiveAssistRagContext(
  input: CompetitiveAssistInput,
  limit = 5
): Promise<RagReference[]> {
  const localContext = searchRagContext(input, limit).map((reference) => ({
    ...reference,
    retrievedFrom: "local-corpus" as const,
    knowledgeLayer: "legacy" as const,
    classification: "internal" as const,
  }))

  try {
    const selectAiContext = await searchSelectAiRagContext(input, limit)

    if (selectAiContext.length === 0) {
      return localContext
    }

    return mergeRagReferences(selectAiContext, localContext, limit)
  } catch {
    return localContext
  }
}

function mergeRagReferences(
  primary: RagReference[],
  fallback: RagReference[],
  limit: number
) {
  const seen = new Set<string>()
  const merged: RagReference[] = []

  for (const reference of [...primary, ...fallback]) {
    const key = `${reference.title.toLowerCase()}::${reference.sourceType}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    merged.push(reference)
  }

  return merged.slice(0, limit)
}
