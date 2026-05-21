"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BrainCircuit,
  CircleHelp,
  DatabaseZap,
  FileText,
  Layers3,
  Loader2,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  loadUseCaseById,
  saveUseCaseWithPersistence,
} from "@/lib/use-case-catalog"
import { cn } from "@/lib/utils"
import type {
  CompetitiveAssistBrief,
  CompetitiveAssistGenerationResult,
  CompetitiveAssistInput,
  CompetitiveCompetitor,
  StrategyDomain,
  WorkbenchTone,
} from "@/types/workbench"

type GenerationMeta = Pick<
  CompetitiveAssistGenerationResult,
  "mode" | "model" | "ragContext" | "warning"
>

const discoveryConfidenceDescriptions = {
  Sparse:
    "Early signal only. Keep assumptions visible and prioritize Discovery Agent questions.",
  Directional:
    "Enough context to form a point of view, but still validate priorities and constraints.",
  Validated:
    "Customer priorities are confirmed, so the SE Assistant can provide firmer field guidance.",
} satisfies Record<CompetitiveAssistInput["discoveryConfidence"], string>

export function CompetitiveAssistWorkspace() {
  const [activeSignalId, setActiveSignalId] = useState(customerSignalChips[0].id)
  const [input, setInput] = useState<CompetitiveAssistInput>(
    customerSignalChips[0].input
  )
  const [brief, setBrief] = useState<CompetitiveAssistBrief>(() =>
    generateCompetitiveAssistBrief(customerSignalChips[0].input)
  )
  const [generationMeta, setGenerationMeta] = useState<GenerationMeta>({
    mode: "mock",
    model: "Local assist engine",
    ragContext: [],
  })
  const [currentUseCaseId, setCurrentUseCaseId] = useState<string>()
  const [catalogMessage, setCatalogMessage] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const selectedStarterScenario = customerSignalChips.find(
    (signal) => signal.id === activeSignalId
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

          setActiveSignalId("template")
          setInput(templateInput)
          setBrief(generateCompetitiveAssistBrief(templateInput))
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

  function updateInput<K extends keyof CompetitiveAssistInput>(
    key: K,
    value: CompetitiveAssistInput[K]
  ) {
    setInput((current) => ({ ...current, [key]: value }))
    setActiveSignalId("custom")
    setCurrentUseCaseId(undefined)
    setCatalogMessage(undefined)
  }

  function applySignalChip(signalId: string) {
    const signal = customerSignalChips.find((item) => item.id === signalId)

    if (!signal) {
      return
    }

    setActiveSignalId(signal.id)
    setInput(signal.input)
    setBrief(generateCompetitiveAssistBrief(signal.input))
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
            Competitive intake
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600">
            Use this intake when the customer context is incomplete. Start from
            what you know, then let the SE Assistant and Discovery Agent infer
            likely priorities, questions, and Oracle positioning.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-950">
              How an SE uses this
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Pick the competitor the customer named, choose a starter scenario
              if one fits, then refine the customer context and strategy domain
              before generating guidance.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-950">
              Competitor selector
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Sets the competitive lens for strengths, risks, talk track, and
              later Debate Arena prompts.
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
              Starter scenarios
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select one when the pursuit resembles a common compete motion,
              then edit the customer context below.
            </p>
            <Select
              value={selectedStarterScenario?.id}
              onValueChange={applySignalChip}
            >
              <SelectTrigger className="mt-2 w-full rounded-md bg-white">
                <SelectValue placeholder="Select a starter scenario" />
              </SelectTrigger>
              <SelectContent>
                {customerSignalChips.map((signal) => {
                  return (
                    <SelectItem key={signal.id} value={signal.id}>
                      {signal.label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedStarterScenario ? (
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {selectedStarterScenario.description}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Current context is custom or loaded from the saved catalog.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer-signal"
              className="text-sm font-semibold text-slate-950"
            >
              Customer context
            </label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Paste the customer’s wording, account notes, or rough compete
              statement. This becomes the source material for the generated
              questions, positioning, talk track, and battle card.
            </p>
            <Textarea
              id="customer-signal"
              value={input.prompt}
              onChange={(event) => updateInput("prompt", event.target.value)}
              className="mt-2 min-h-32 resize-none rounded-md bg-slate-50 text-sm"
            />
          </div>

          <div className="grid gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Strategy domain
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use this when the same competitor could mean different
                conversations, such as Snowflake for lakehouse versus Azure for
                AI platform strategy.
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

            <div>
              <div className="text-sm font-semibold text-slate-950">
                Discovery confidence
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Tell the model how much is known. Sparse keeps assumptions
                visible; validated produces firmer field guidance.
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
                      onClick={() => updateInput("discoveryConfidence", level)}
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
            {isGenerating ? "Generating with OpenAI" : "Generate field assist"}
          </Button>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-950">
              How this drives the output
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              The selections on the left control the generated panels on the
              right. Competitor shapes strengths and risks, strategy domain
              shapes Oracle positioning, and confidence controls how cautious
              the SE Assistant should be. Each generation is saved to the use
              case catalog and becomes available in Debate Arena.
            </p>
          </div>

          <CatalogStatusCard
            message={catalogMessage}
            currentUseCaseId={currentUseCaseId}
          />
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <AssistCommandBar brief={brief} isGenerating={isGenerating} />

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

        <WorkflowHandoffStrip
          debateDescription={brief.feeds.debateArena}
          architectureDescription={brief.feeds.architectureGenerator}
          ragCount={generationMeta.ragContext.length}
        />
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
  isGenerating,
}: {
  brief: CompetitiveAssistBrief
  isGenerating: boolean
}) {
  return (
    <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
      <CardContent className="grid gap-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] xl:items-stretch">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-md bg-white text-slate-950">
              {brief.competitor}
            </Badge>
            <Badge className="rounded-md bg-red-600 text-white">
              {brief.discoveryConfidence} Discovery Agent confidence
            </Badge>
            <Badge className="rounded-md bg-white/10 text-white">
              {isGenerating ? "Generating" : "Generated guidance"}
            </Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {brief.prompt}
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
        <div className="grid min-w-0 gap-2 text-sm sm:grid-cols-2">
          <ReadinessStat
            label="Likely priorities"
            value={brief.inferredPriorities.length}
            description="Customer needs the SE Assistant inferred from the context. Treat them as hypotheses until the Discovery Agent validates them."
          />
          <ReadinessStat
            label="Field guidance points"
            value={brief.battleCardGuidance.length}
            description="Concise battle-card recommendations the SE can use in a prep call or customer conversation."
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ReadinessStat({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div
      className="rounded-md border border-white/10 bg-white/10 p-3"
      title={description}
      aria-label={`${label}: ${description}`}
    >
      <div className="text-xs text-slate-300">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-xs leading-5 text-slate-300">{description}</p>
    </div>
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
      <CardContent className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {row.label}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{row.value}</p>
          </div>
        ))}
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-red-300" />
            Concise field guidance
          </div>
          <ul className="mt-3 space-y-2">
            {brief.battleCardGuidance.map((item) => (
              <li key={item} className="text-sm leading-6 text-slate-100">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function WorkflowHandoffStrip({
  debateDescription,
  architectureDescription,
  ragCount,
}: {
  debateDescription: string
  architectureDescription: string
  ragCount: number
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardContent className="grid gap-3 py-4 lg:grid-cols-3">
        <HandoffStripItem
          icon={BrainCircuit}
          label="Debate Arena"
          body={debateDescription}
        />
        <HandoffStripItem
          icon={Layers3}
          label="Architecture Generator"
          body={architectureDescription}
        />
        <HandoffStripItem
          icon={DatabaseZap}
          label="Knowledge context"
          body={
            ragCount > 0
              ? `${ragCount} retrieval references are attached to this use case.`
              : "RAG context will attach after generation."
          }
        />
      </CardContent>
    </Card>
  )
}

function HandoffStripItem({
  icon: Icon,
  label,
  body,
}: {
  icon: LucideIcon
  label: string
  body: string
}) {
  return (
    <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-slate-200">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-950">{label}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {body}
        </p>
      </div>
    </div>
  )
}
