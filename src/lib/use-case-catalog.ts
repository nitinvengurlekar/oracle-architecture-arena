import type {
  CompetitiveAssistGenerationResult,
  CompetitiveAssistInput,
  UseCaseCatalogItem,
} from "@/types/workbench"
import { seededUseCaseCatalogItems } from "@/data/smoke-test-fixtures"

const CATALOG_STORAGE_KEY = "oracle-architecture-arena.use-case-catalog.v1"

type SaveUseCaseOptions = {
  existingId?: string
  input: CompetitiveAssistInput
  result: CompetitiveAssistGenerationResult
}

type UseCaseCatalogApiResponse = {
  items: UseCaseCatalogItem[]
  source: "database" | "seeded-fallback"
  warning?: string
}

type UseCaseApiResponse = {
  item: UseCaseCatalogItem | null
  source: "database" | "seeded-fallback"
  warning?: string
}

type SaveUseCaseApiResponse = {
  item: UseCaseCatalogItem
  source: "database"
}

export async function loadUseCaseCatalog(): Promise<UseCaseCatalogItem[]> {
  try {
    const response = await fetch("/api/use-cases")

    if (!response.ok) {
      return readUseCaseCatalog()
    }

    const result = (await response.json()) as UseCaseCatalogApiResponse

    if (result.source === "database") {
      return mergeCatalogItems(result.items, readRawLocalUseCaseCatalog())
    }

    return readUseCaseCatalog()
  } catch {
    return readUseCaseCatalog()
  }
}

export async function loadUseCaseById(id: string) {
  try {
    const response = await fetch(`/api/use-cases/${id}`)

    if (!response.ok) {
      return readUseCaseById(id)
    }

    const result = (await response.json()) as UseCaseApiResponse

    if (result.source === "database") {
      return result.item
    }

    return readUseCaseById(id)
  } catch {
    return readUseCaseById(id)
  }
}

export async function saveUseCaseWithPersistence(options: SaveUseCaseOptions) {
  try {
    const response = await fetch("/api/use-cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })
    const result = (await response.json()) as
      | SaveUseCaseApiResponse
      | { fallbackToLocal?: boolean }

    if (response.ok && "item" in result) {
      saveUseCaseItemToLocal(result.item)

      return {
        item: result.item,
        source: "database" as const,
      }
    }
  } catch {
    // The local catalog remains the development fallback until ADB is active.
  }

  return {
    item: saveUseCaseToCatalog(options),
    source: "local-fallback" as const,
  }
}

export function readUseCaseCatalog(): UseCaseCatalogItem[] {
  if (typeof window === "undefined") {
    return seededUseCaseCatalogItems
  }

  try {
    const rawValue = window.localStorage.getItem(CATALOG_STORAGE_KEY)

    if (!rawValue) {
      return seededUseCaseCatalogItems
    }

    const parsedValue = JSON.parse(rawValue)

    return Array.isArray(parsedValue)
      ? mergeSeededUseCases(parsedValue)
      : seededUseCaseCatalogItems
  } catch {
    return seededUseCaseCatalogItems
  }
}

export function readUseCaseById(id: string) {
  return readUseCaseCatalog().find((item) => item.id === id)
}

export function saveUseCaseToCatalog({
  existingId,
  input,
  result,
}: SaveUseCaseOptions) {
  const catalog = readUseCaseCatalog()
  const now = new Date().toISOString()
  const existingItem = existingId
    ? catalog.find((item) => item.id === existingId)
    : undefined
  const id = existingItem?.id ?? createUseCaseId()
  const item: UseCaseCatalogItem = {
    id,
    title: createUseCaseTitle(input),
    createdAt: existingItem?.createdAt ?? now,
    updatedAt: now,
    input,
    brief: result.brief,
    generation: {
      mode: result.mode,
      model: result.model,
      warning: result.warning,
    },
    ragContext: result.ragContext,
  }
  const nextCatalog = [
    item,
    ...catalog.filter((catalogItem) => catalogItem.id !== id),
  ].slice(0, 25)

  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(nextCatalog))

  return item
}

function mergeSeededUseCases(catalog: UseCaseCatalogItem[]) {
  const catalogIds = new Set(catalog.map((item) => item.id))
  const missingSeedItems = seededUseCaseCatalogItems.filter(
    (item) => !catalogIds.has(item.id)
  )

  return [...missingSeedItems, ...catalog]
}

function readRawLocalUseCaseCatalog() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(CATALOG_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function saveUseCaseItemToLocal(item: UseCaseCatalogItem) {
  if (typeof window === "undefined") {
    return item
  }

  const catalog = readUseCaseCatalog()
  const nextCatalog = [
    item,
    ...catalog.filter((catalogItem) => catalogItem.id !== item.id),
  ].slice(0, 25)

  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(nextCatalog))

  return item
}

function mergeCatalogItems(
  primaryItems: UseCaseCatalogItem[],
  secondaryItems: UseCaseCatalogItem[]
) {
  const primaryIds = new Set(primaryItems.map((item) => item.id))
  const missingSecondaryItems = secondaryItems.filter(
    (item) => !primaryIds.has(item.id)
  )

  return [...primaryItems, ...missingSecondaryItems]
}

function createUseCaseId() {
  if (typeof window !== "undefined" && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `use-case-${Date.now()}`
}

function createUseCaseTitle(input: CompetitiveAssistInput) {
  const prompt = input.prompt.trim().replace(/\s+/g, " ")
  const firstSentence = prompt.split(/[.!?]/)[0]?.trim()
  const title = firstSentence || `${input.competitor} ${formatDomain(input.domain)}`

  return title.length > 72 ? `${title.slice(0, 69)}...` : title
}

function formatDomain(domain: CompetitiveAssistInput["domain"]) {
  return domain.replaceAll("-", " ")
}
