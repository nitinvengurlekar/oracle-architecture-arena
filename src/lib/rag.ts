import { ragDocuments } from "@/data/rag-corpus"
import type {
  CompetitiveAssistInput,
  RagDocument,
  RagReference,
} from "@/types/workbench"

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
])

export function searchRagContext(
  input: CompetitiveAssistInput,
  limit = 5
): RagReference[] {
  const queryTokens = tokenize(
    `${input.prompt} ${input.competitor} ${input.domain} ${input.discoveryConfidence}`
  )

  return ragDocuments
    .map((document) => ({
      document,
      score: scoreDocument(document, input, queryTokens),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document, score }) => ({
      id: document.id,
      title: document.title,
      sourceType: document.sourceType,
      excerpt: document.excerpt,
      score,
    }))
}

function scoreDocument(
  document: RagDocument,
  input: CompetitiveAssistInput,
  queryTokens: string[]
) {
  const documentTokens = tokenize(
    `${document.title} ${document.keywords.join(" ")} ${document.excerpt}`
  )
  const documentTokenSet = new Set(documentTokens)

  const tokenScore = queryTokens.reduce((score, token) => {
    return score + (documentTokenSet.has(token) ? 1 : 0)
  }, 0)

  const domainScore =
    document.domain === input.domain || document.domain === "cross-domain" ? 6 : 0
  const competitorScore = document.competitor === input.competitor ? 5 : 0
  const keywordScore = document.keywords.reduce((score, keyword) => {
    return score + (input.prompt.toLowerCase().includes(keyword.toLowerCase()) ? 2 : 0)
  }, 0)

  return tokenScore + domainScore + competitorScore + keywordScore
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}
