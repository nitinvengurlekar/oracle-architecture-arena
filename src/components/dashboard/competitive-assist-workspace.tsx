"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CircleHelp,
  FileText,
  Loader2,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  competitiveCompetitors,
  competitiveDomains,
  customerSignalChips,
  discoveryConfidenceLevels,
  generateCompetitiveAssistBrief,
} from "@/lib/competitive-assist"
import { getToneClasses } from "@/lib/tone"
import {
  loadUseCaseCatalog,
  loadUseCaseById,
  saveUseCaseWithPersistence,
} from "@/lib/use-case-catalog"
import {
  competitiveAssistWorkflowTabs,
  getCompetitiveAssistWorkflowTab,
} from "@/lib/navigation"
import { cn } from "@/lib/utils"
import type {
  CompetitiveAssistBrief,
  CompetitiveAssistGenerationResult,
  CompetitiveAssistInput,
  CompetitiveCompetitor,
  StrategyDomain,
  UseCaseCatalogItem,
  WorkbenchTone,
} from "@/types/workbench"

type GenerationMeta = Pick<
  CompetitiveAssistGenerationResult,
  "mode" | "model" | "ragContext" | "warning"
>

const noStarterScenarioValue = "none"

const discoveryConfidenceDescriptions = {
  Sparse:
    "Early signal only. Keep assumptions visible and prioritize Discovery Agent questions.",
  Directional:
    "Enough context to form a point of view, but still validate priorities and constraints.",
  Validated:
    "Customer priorities are confirmed, so the SE Assistant can provide firmer field guidance.",
} satisfies Record<CompetitiveAssistInput["discoveryConfidence"], string>

const autoManagedScenarioPrompts = new Set(
  customerSignalChips.map((signal) => normalizePrompt(signal.input.prompt))
)

export function CompetitiveAssistWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeWorkflowTab = getCompetitiveAssistWorkflowTab(
    searchParams.get("assistTab")
  )
  const assistPanelTitle =
    activeWorkflowTab === "competitor-analysis"
      ? "Sharpen the Competitive Lens"
      : "Build strategy from Customer Context"
  const [activeSignalId, setActiveSignalId] = useState(customerSignalChips[0].id)
  const [input, setInput] = useState<CompetitiveAssistInput>(
    customerSignalChips[0].input
  )
  const [brief, setBrief] = useState<CompetitiveAssistBrief>(() =>
    generateCompetitiveAssistBrief(customerSignalChips[0].input)
  )
  const [, setGenerationMeta] = useState<GenerationMeta>({
    mode: "mock",
    model: "Local assist engine",
    ragContext: [],
  })
  const [currentUseCaseId, setCurrentUseCaseId] = useState<string>()
  const [catalogMessage, setCatalogMessage] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [catalogItems, setCatalogItems] = useState<UseCaseCatalogItem[]>([])
  const [catalogSearch, setCatalogSearch] = useState("")
  const selectedStarterScenario = customerSignalChips.find(
    (signal) => signal.id === activeSignalId
  )
  const competitorCatalogMatches = useMemo(
    () =>
      filterCatalogForCompetitorAnalysis(
        catalogItems,
        input.competitor,
        input.domain,
        catalogSearch
      ),
    [catalogItems, catalogSearch, input.competitor, input.domain]
  )

  useEffect(() => {
    let isActive = true
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const params = new URLSearchParams(window.location.search)
        const useCaseId = params.get("useCaseId")

        if (!useCaseId) {
          const templateInput = getTemplateInputFromParams(params)

          if (!templateInput || !isActive) {
            return
          }

          const syncedTemplateInput = syncAutoScenarioPrompt(templateInput)

          setActiveSignalId("template")
          setInput(syncedTemplateInput)
          setBrief(generateCompetitiveAssistBrief(syncedTemplateInput))
          setGenerationMeta({
            mode: "mock",
            model: "Template starter",
            ragContext: [],
          })
          setCurrentUseCaseId(undefined)
          setCatalogMessage(
            "Loaded from editable pursuit template. Generate to save."
          )
          return
        }

        const savedUseCase = await loadUseCaseById(useCaseId)

        if (!isActive) {
          return
        }

        if (!savedUseCase) {
          setCatalogMessage("Saved use case was not found in the catalog.")
          return
        }

        setActiveSignalId("catalog")
        setInput(savedUseCase.input)
        setBrief(savedUseCase.brief)
        setGenerationMeta({
          mode: savedUseCase.generation.mode,
          model: savedUseCase.generation.model,
          ragContext: savedUseCase.ragContext,
          warning: savedUseCase.generation.warning,
        })
        setCurrentUseCaseId(savedUseCase.id)
        setCatalogMessage("Loaded from use case catalog.")
      })()
    }, 0)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    void loadUseCaseCatalog().then((items) => {
      if (isActive) {
        setCatalogItems(items)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  function updateInput<K extends keyof CompetitiveAssistInput>(
    key: K,
    value: CompetitiveAssistInput[K]
  ) {
    setInput((current) => {
      const nextInput = { ...current, [key]: value }

      const syncedInput = shouldSyncScenarioPrompt(key, current.prompt)
        ? syncAutoScenarioPrompt(nextInput)
        : nextInput

      setBrief(generateCompetitiveAssistBrief(syncedInput))
      setGenerationMeta({
        mode: "mock",
        model: "Local assist preview",
        ragContext: [],
      })

      return syncedInput
    })
    setActiveSignalId("custom")
    setCurrentUseCaseId(undefined)
    setCatalogMessage(undefined)
  }

  function applyStarterScenario(value: string) {
    if (value === noStarterScenarioValue) {
      setActiveSignalId("custom")
      setCurrentUseCaseId(undefined)
      setCatalogMessage(undefined)
      return
    }

    applySignalChip(value)
  }

  function selectIntakePage(value: string) {
    const nextPage = getCompetitiveAssistWorkflowTab(value)
    const nextParams = new URLSearchParams(searchParams.toString())

    nextParams.set("assistTab", nextPage)
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false })
  }

  function applySignalChip(signalId: string) {
    const signal = customerSignalChips.find((item) => item.id === signalId)

    if (!signal) {
      return
    }

    const nextInput = shouldPreserveCustomScenarioPrompt(input.prompt)
      ? {
          ...signal.input,
          prompt: input.prompt,
        }
      : signal.input

    setActiveSignalId(signal.id)
    setInput(nextInput)
    setBrief(generateCompetitiveAssistBrief(nextInput))
    setGenerationMeta({
      mode: "mock",
      model: "Local assist engine",
      ragContext: [],
    })
    setCurrentUseCaseId(undefined)
    setCatalogMessage(undefined)
  }

  async function generateAssist() {
    const fallbackBrief = generateCompetitiveAssistBrief(input)

    setIsGenerating(true)

    try {
      const response = await fetch("/api/competitive-assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })
      const result = (await response.json()) as
        | CompetitiveAssistGenerationResult
        | { error?: string }

      if (!response.ok) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to generate assist."
        )
      }

      if (!("brief" in result)) {
        throw new Error("Unable to generate assist.")
      }

      setBrief(result.brief)
      setGenerationMeta({
        mode: result.mode,
        model: result.model,
        ragContext: result.ragContext,
        warning: result.warning,
      })
      const savedUseCase = await saveUseCaseWithPersistence({
        existingId: currentUseCaseId,
        input,
        result,
      })
      setCurrentUseCaseId(savedUseCase.item.id)
      setCatalogMessage(
        savedUseCase.source === "database"
          ? "Saved to database-backed use case catalog."
          : "Saved to browser catalog until ADB is ready."
      )
    } catch {
      setBrief(fallbackBrief)
      const fallbackResult: CompetitiveAssistGenerationResult = {
        brief: fallbackBrief,
        mode: "mock",
        model: "Local assist engine",
        ragContext: [],
        warning:
          "The live generation request did not complete, so the page used the local fallback assist.",
      }

      setGenerationMeta({
        mode: fallbackResult.mode,
        model: fallbackResult.model,
        ragContext: fallbackResult.ragContext,
        warning: fallbackResult.warning,
      })
      const savedUseCase = await saveUseCaseWithPersistence({
        existingId: currentUseCaseId,
        input,
        result: fallbackResult,
      })
      setCurrentUseCaseId(savedUseCase.item.id)
      setCatalogMessage(
        savedUseCase.source === "database"
          ? "Saved fallback output to database-backed use case catalog."
          : "Saved fallback output to browser catalog until ADB is ready."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[400px_1fr]">
      <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
        <CardHeader className="rounded-t-md border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <Badge className="rounded-md bg-red-600 text-white">
              Field enablement console
            </Badge>
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Swords className="size-4" />
            </span>
          </div>
          <CardTitle className="pt-2 text-xl font-semibold text-slate-950">
            {assistPanelTitle}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <Tabs
            value={activeWorkflowTab}
            onValueChange={selectIntakePage}
            className="gap-4"
          >
            <TabsList className="grid !h-auto w-full grid-cols-1 items-stretch rounded-md border border-slate-200 bg-slate-50 p-1 md:hidden">
              {competitiveAssistWorkflowTabs.map((page) => (
                <TabsTrigger
                  key={page.id}
                  value={page.id}
                  className="!h-auto min-h-10 whitespace-normal rounded px-2 py-2 text-center text-xs font-semibold leading-4 data-active:bg-slate-950 data-active:text-white"
                >
                  {page.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent
              value="customer-scenario-analysis"
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="customer-scenario"
                  className="text-sm font-semibold text-slate-950"
                >
                  Customer scenario
                </label>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Paste customer wording, account notes, or rough compete
                  statement.
                </p>
                <Textarea
                  id="customer-scenario"
                  value={input.prompt}
                  onChange={(event) =>
                    updateInput("prompt", event.target.value)
                  }
                  className="mt-2 min-h-36 resize-none rounded-md bg-slate-50 text-sm"
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Starter scenario
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Optional. Select one when the pursuit resembles a common
                  compete motion, then edit the customer scenario below.
                </p>
                <Select
                  value={selectedStarterScenario?.id ?? noStarterScenarioValue}
                  onValueChange={applyStarterScenario}
                >
                  <SelectTrigger className="mt-2 w-full rounded-md bg-white">
                    <SelectValue placeholder="Select a starter scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={noStarterScenarioValue}>
                      N/A / Other
                    </SelectItem>
                    {customerSignalChips.map((signal) => {
                      return (
                        <SelectItem key={signal.id} value={signal.id}>
                          {signal.label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Discovery confidence
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Tell the SE Assistant how much is known. Sparse keeps
                  assumptions visible; validated produces firmer field guidance.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {discoveryConfidenceLevels.map((level) => {
                    const description = discoveryConfidenceDescriptions[level]

                    return (
                      <button
                        key={level}
                        type="button"
                        title={description}
                        aria-label={`${level}: ${description}`}
                        onClick={() =>
                          updateInput("discoveryConfidence", level)
                        }
                        className={cn(
                          "group relative rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                          input.discoveryConfidence === level
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {level}
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-md bg-slate-950 p-3 text-left text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-visible:block">
                          {description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={generateAssist}
                disabled={isGenerating || input.prompt.trim().length === 0}
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <WandSparkles className="size-4" />
                )}
                {isGenerating
                  ? "Generating with OpenAI"
                  : "Generate field assist"}
              </Button>

              <CatalogStatusCard
                message={catalogMessage}
                currentUseCaseId={currentUseCaseId}
              />
            </TabsContent>

            <TabsContent value="competitor-analysis" className="space-y-5">
              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Competitor selector
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sets the competitive lens for strengths, risks, talk track,
                  and later Debate Arena prompts.
                </p>
                <Select
                  value={input.competitor}
                  onValueChange={(value) =>
                    updateInput("competitor", value as CompetitiveCompetitor)
                  }
                >
                  <SelectTrigger className="mt-2 w-full rounded-md bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {competitiveCompetitors.map((competitor) => (
                      <SelectItem key={competitor} value={competitor}>
                        {competitor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Strategy domain
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Use this when the same competitor could mean different
                  conversations, such as Snowflake for lakehouse versus Azure
                  for AI platform strategy.
                </p>
                <Select
                  value={input.domain}
                  onValueChange={(value) =>
                    updateInput("domain", value as StrategyDomain)
                  }
                >
                  <SelectTrigger className="mt-2 w-full rounded-md bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {competitiveDomains.map((domain) => (
                      <SelectItem key={domain.value} value={domain.value}>
                        {domain.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SearchUseCatalogCard
                query={catalogSearch}
                matches={competitorCatalogMatches}
                competitor={input.competitor}
                domain={input.domain}
                onQueryChange={setCatalogSearch}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <AssistCommandBar brief={brief} />

        <section className="grid items-stretch gap-4 lg:grid-cols-2">
          <ConsolePanel
            title="Discovery Agent questions"
            icon={CircleHelp}
            tone="blue"
            eyebrow="Ask next"
          >
            <NumberedList items={brief.discoveryQuestions} />
          </ConsolePanel>

          <ConsolePanel
            title="Oracle positioning guidance"
            icon={Target}
            tone="red"
            eyebrow="Position"
          >
            <BulletList items={brief.oracleOpportunities} />
          </ConsolePanel>
        </section>

        <section className="grid items-stretch gap-4 lg:grid-cols-2">
          <ConsolePanel
            title="Competitor strengths panel"
            icon={Trophy}
            tone="amber"
            eyebrow={brief.competitor ?? "Competitor"}
          >
            <BulletList items={brief.competitorStrengths} />
          </ConsolePanel>

          <ConsolePanel
            title="Recommended talk track"
            icon={MessageSquareQuote}
            tone="emerald"
            eyebrow="Customer-ready"
          >
            <NumberedList items={brief.recommendedTalkTrack} />
          </ConsolePanel>
        </section>

        <section>
          <BattleCardOutput brief={brief} />
        </section>
      </div>
    </div>
  )
}

function getTemplateInputFromParams(
  params: URLSearchParams
): CompetitiveAssistInput | undefined {
  const prompt = params.get("prompt")?.trim()
  const competitor = params.get("competitor")
  const domain = params.get("domain")
  const discoveryConfidence = params.get("discoveryConfidence")

  if (
    !prompt ||
    !isCompetitiveCompetitor(competitor) ||
    !isStrategyDomain(domain) ||
    !isDiscoveryConfidence(discoveryConfidence)
  ) {
    return undefined
  }

  return {
    prompt,
    competitor,
    domain,
    discoveryConfidence,
  }
}

function isCompetitiveCompetitor(
  value: string | null
): value is CompetitiveCompetitor {
  return competitiveCompetitors.includes(value as CompetitiveCompetitor)
}

function isStrategyDomain(value: string | null): value is StrategyDomain {
  return competitiveDomains.some((domain) => domain.value === value)
}

function isDiscoveryConfidence(
  value: string | null
): value is CompetitiveAssistInput["discoveryConfidence"] {
  return discoveryConfidenceLevels.includes(
    value as CompetitiveAssistInput["discoveryConfidence"]
  )
}

function shouldSyncScenarioPrompt(
  key: keyof CompetitiveAssistInput,
  prompt: string
) {
  return (
    (key === "competitor" || key === "domain") &&
    isAutoManagedScenarioPrompt(prompt)
  )
}

function isAutoManagedScenarioPrompt(prompt: string) {
  const normalizedPrompt = normalizePrompt(prompt)

  return (
    autoManagedScenarioPrompts.has(normalizedPrompt) ||
    /^Customer is evaluating .+ for (data platform and lakehouse modernization|Oracle database modernization|AI\/ML platform strategy|a government or sovereign deployment)\.$/.test(
      normalizedPrompt
    )
  )
}

function shouldPreserveCustomScenarioPrompt(prompt: string) {
  return prompt.trim().length > 0 && !isAutoManagedScenarioPrompt(prompt)
}

function syncAutoScenarioPrompt(input: CompetitiveAssistInput) {
  if (!isAutoManagedScenarioPrompt(input.prompt)) {
    return input
  }

  return {
    ...input,
    prompt: createLensScenarioPrompt(input),
  }
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ")
}

function createLensScenarioPrompt({
  competitor,
  domain,
}: Pick<CompetitiveAssistInput, "competitor" | "domain">) {
  const competitorLabel =
    competitor === "Other" ? "another competing option" : competitor

  switch (domain) {
    case "lakehouse-modernization":
      return `Customer is evaluating ${competitorLabel} for data platform and lakehouse modernization.`
    case "database-modernization":
      return `Customer is evaluating ${competitorLabel} for Oracle database modernization.`
    case "ai-ml-platform":
      return `Customer is evaluating ${competitorLabel} for AI/ML platform strategy.`
    case "sovereign-deployment":
      return `Customer is evaluating ${competitorLabel} for a government or sovereign deployment.`
  }
}

function filterCatalogForCompetitorAnalysis(
  items: UseCaseCatalogItem[],
  competitor: CompetitiveCompetitor,
  domain: StrategyDomain,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()

  return items
    .filter((item) => {
      const matchesCurrentLens =
        item.input.competitor === competitor || item.input.domain === domain
      const searchableText = [
        item.title,
        item.input.prompt,
        item.input.competitor,
        formatDomain(item.input.domain),
        item.brief.battleCardOutput.headline,
      ]
        .join(" ")
        .toLowerCase()

      return (
        (matchesCurrentLens || normalizedQuery.length > 0) &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      )
    })
    .sort((first, second) => {
      const firstScore =
        (first.input.competitor === competitor ? 2 : 0) +
        (first.input.domain === domain ? 1 : 0)
      const secondScore =
        (second.input.competitor === competitor ? 2 : 0) +
        (second.input.domain === domain ? 1 : 0)

      return secondScore - firstScore
    })
    .slice(0, 3)
}

function SearchUseCatalogCard({
  query,
  matches,
  competitor,
  domain,
  onQueryChange,
}: {
  query: string
  matches: UseCaseCatalogItem[]
  competitor: CompetitiveCompetitor
  domain: StrategyDomain
  onQueryChange: (query: string) => void
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Search Use Case Catalog
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            The list starts with pre-searched use cases for {competitor} /{" "}
            {formatDomain(domain)}. Search narrows the saved catalog.
          </p>
        </div>
        <Search className="mt-0.5 size-4 shrink-0 text-slate-400" />
      </div>

      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by customer, platform, workload"
        className="mt-3 h-9 rounded-md bg-slate-50 text-sm"
      />

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pre-searched Use Cases
        </div>
        <div className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
          {matches.length} shown
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {matches.length > 0 ? (
          matches.map((item) => (
            <Link
              key={item.id}
              href={`/competitive-se-assist?assistTab=customer-scenario-analysis&useCaseId=${item.id}`}
              className="block rounded-md border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-slate-300 hover:bg-white"
            >
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-600"
                >
                  {item.input.competitor}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-600"
                >
                  {formatDomain(item.input.domain)}
                </Badge>
              </div>
              <div className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-slate-950">
                {item.title}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {item.input.prompt}
              </p>
            </Link>
          ))
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            No matching saved use cases yet. Generate a field assist from
            Customer Scenario Analysis to create one.
          </p>
        )}
      </div>

      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
        <Link href="/scenarios">Open Scenarios catalog</Link>
      </Button>
    </div>
  )
}

function formatDomain(value: string) {
  return (
    competitiveDomains.find((domain) => domain.value === value)?.label ??
    value.replaceAll("-", " ")
  )
}

function CatalogStatusCard({
  message,
  currentUseCaseId,
}: {
  message?: string
  currentUseCaseId?: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Use case catalog
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {message ??
              "Generate with the SE Assistant to save this use case for Scenarios and Debate Arena."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/scenarios">View catalog</Link>
        </Button>
      </div>
      {currentUseCaseId ? (
        <div className="mt-2 truncate rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
          {currentUseCaseId}
        </div>
      ) : null}
    </div>
  )
}

function AssistCommandBar({
  brief,
}: {
  brief: CompetitiveAssistBrief
}) {
  const title =
    brief.competitor && brief.domain
      ? createLensScenarioPrompt({
          competitor: brief.competitor,
          domain: brief.domain,
        })
      : brief.prompt

  return (
    <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
      <CardContent className="py-5">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.customerSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConsolePanel({
  title,
  eyebrow,
  icon: Icon,
  tone,
  children,
}: {
  title: string
  eyebrow: string
  icon: LucideIcon
  tone: WorkbenchTone
  children: React.ReactNode
}) {
  const toneClass = getToneClasses(tone)

  return (
    <Card className="h-full rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {eyebrow}
            </div>
            <CardTitle className="mt-1 text-lg font-semibold text-slate-950">
              {title}
            </CardTitle>
          </div>
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-md ring-1",
              toneClass.soft
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function BattleCardOutput({ brief }: { brief: CompetitiveAssistBrief }) {
  const rows = [
    {
      label: "Customer concern",
      value: brief.battleCardOutput.customerConcern,
    },
    {
      label: "Oracle position",
      value: brief.battleCardOutput.oraclePosition,
    },
    {
      label: "Landmine",
      value: brief.battleCardOutput.landmine,
    },
    {
      label: "Next move",
      value: brief.battleCardOutput.nextMove,
    },
  ]

  return (
    <Card className="h-full rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Battle card output
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              {brief.battleCardOutput.headline}
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white">
            <FileText className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {row.label}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{row.value}</p>
          </div>
        ))}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Concise field guidance
          </div>
          <ul className="mt-3 space-y-3">
            {brief.battleCardGuidance.map((item) => (
              <li key={item} className="text-sm leading-6 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
