"use client"

import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  DatabaseZap,
  Gavel,
  Gauge,
  Loader2,
  Scale,
  ShieldCheck,
  Swords,
  Target,
  TriangleAlert,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

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
import { competitiveCompetitors } from "@/lib/competitive-assist"
import { getToneClasses } from "@/lib/tone"
import { loadUseCaseCatalog } from "@/lib/use-case-catalog"
import { cn } from "@/lib/utils"
import type {
  ArchitectureDebate,
  DebateArenaGenerationInput,
  DebateArenaGenerationResult,
  DebateAgentPanel,
  DebateScore,
  CompetitiveCompetitor,
  UseCaseCatalogItem,
  WorkbenchTone,
} from "@/types/workbench"

const agentIcons = {
  oracle: DatabaseZap,
  competitor: Swords,
  judge: Gavel,
} satisfies Record<DebateAgentPanel["role"], LucideIcon>

type DebateGenerationMeta = Pick<
  DebateArenaGenerationResult,
  | "mode"
  | "model"
  | "reasoningEffort"
  | "ragContext"
  | "warning"
  | "runId"
  | "source"
>

type SavedDebateRun = {
  id: string
  useCaseId: string
  input: DebateArenaGenerationInput
  debate: ArchitectureDebate
  generation: {
    mode: DebateArenaGenerationResult["mode"]
    model?: string
    reasoningEffort?: string
    warning?: string
  }
  ragContext: DebateArenaGenerationResult["ragContext"]
  createdAt: string
}

type DebateRunsApiResponse = {
  items: SavedDebateRun[]
  source: "database" | "seeded-fallback"
  warning?: string
}

const emptyGenerationMeta: DebateGenerationMeta = {
  mode: "mock",
  ragContext: [],
}

export function DebateArenaWorkspace({
  debate,
}: {
  debate: ArchitectureDebate
}) {
  const [catalogItems, setCatalogItems] = useState<UseCaseCatalogItem[]>([])
  const [selectedUseCaseId, setSelectedUseCaseId] = useState("")
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<CompetitiveCompetitor>("Databricks")
  const [currentDebate, setCurrentDebate] = useState<ArchitectureDebate>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingSavedDebate, setIsLoadingSavedDebate] = useState(false)
  const [generationMeta, setGenerationMeta] =
    useState<DebateGenerationMeta>(emptyGenerationMeta)
  const savedDebateRequestId = useRef(0)
  const selectedUseCase = catalogItems.find(
    (item) => item.id === selectedUseCaseId
  )
  const debateInput = useMemo(
    () =>
      createDebateInput({
        baseline: debate,
        selectedUseCase,
        selectedCompetitor,
      }),
    [debate, selectedUseCase, selectedCompetitor]
  )
  const oracleTotal = currentDebate
    ? weightedScore(
        currentDebate.scores.map((score) => ({
          score: score.oracleScore,
          weight: score.judgeWeight,
        }))
      )
    : 0
  const competitorTotal = currentDebate
    ? weightedScore(
        currentDebate.scores.map((score) => ({
          score: score.competitorScore,
          weight: score.judgeWeight,
        }))
      )
    : 0

  useEffect(() => {
    let isActive = true
    const timeoutId = window.setTimeout(() => {
      void loadUseCaseCatalog().then((items) => {
        if (!isActive) {
          return
        }

        setCatalogItems(items)
      })
    }, 0)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [])

  async function updateSelectedUseCase(value: string) {
    const requestId = savedDebateRequestId.current + 1
    savedDebateRequestId.current = requestId
    setSelectedUseCaseId(value)
    setCurrentDebate(undefined)
    setGenerationMeta({
      ...emptyGenerationMeta,
      warning: "Checking for a saved Debate Arena run for this use case.",
    })

    const useCase = catalogItems.find((item) => item.id === value)

    if (useCase) {
      setSelectedCompetitor(useCase.input.competitor)
    }

    if (!value) {
      setGenerationMeta(emptyGenerationMeta)
      return
    }

    setIsLoadingSavedDebate(true)

    try {
      const result = await fetchLatestSavedDebate(value)
      const savedRun = result.items[0]

      if (savedDebateRequestId.current !== requestId) {
        return
      }

      if (savedRun) {
        setCurrentDebate(savedRun.debate)
        setSelectedCompetitor(savedRun.input.competitor)
        setGenerationMeta({
          mode: savedRun.generation.mode,
          model: savedRun.generation.model,
          reasoningEffort: savedRun.generation.reasoningEffort,
          ragContext: savedRun.ragContext,
          warning: savedRun.generation.warning,
          runId: savedRun.id,
          source: result.source === "database" ? "database" : undefined,
        })
        return
      }

      setGenerationMeta({
        ...emptyGenerationMeta,
        source: result.source === "database" ? "database" : undefined,
        warning:
          result.warning ??
          "No saved debate exists for this use case yet. Generate one to preserve it for later.",
      })
    } catch {
      if (savedDebateRequestId.current !== requestId) {
        return
      }

      setGenerationMeta({
        ...emptyGenerationMeta,
        warning:
          "Saved debate lookup did not complete. Generate a debate to create one for this use case.",
      })
    } finally {
      if (savedDebateRequestId.current === requestId) {
        setIsLoadingSavedDebate(false)
      }
    }
  }

  async function generateDebate() {
    if (!selectedUseCase) {
      setGenerationMeta({
        ...emptyGenerationMeta,
        warning: "Select a use case before generating a Debate Arena review.",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/debate-arena", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debateInput),
      })
      const result = (await response.json()) as
        | DebateArenaGenerationResult
        | { error?: string }

      if (!response.ok) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to generate debate."
        )
      }

      if (!("debate" in result)) {
        throw new Error("Unable to generate debate.")
      }

      setCurrentDebate(result.debate)
      setGenerationMeta({
        mode: result.mode,
        model: result.model,
        reasoningEffort: result.reasoningEffort,
        ragContext: result.ragContext,
        warning: result.warning,
        runId: result.runId,
        source: result.source,
      })
    } catch {
      setGenerationMeta((current) => ({
        ...current,
        warning:
          "The Debate Arena generation request did not complete. The current debate remains visible.",
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DebateControls
        catalogItems={catalogItems}
        selectedUseCaseId={selectedUseCaseId}
        selectedCompetitor={selectedCompetitor}
        generationMeta={generationMeta}
        isGenerating={isGenerating}
        isLoadingSavedDebate={isLoadingSavedDebate}
        hasCurrentDebate={Boolean(currentDebate)}
        onSelectUseCase={updateSelectedUseCase}
        onSelectCompetitor={setSelectedCompetitor}
        onGenerate={generateDebate}
      />

      {currentDebate ? (
        <>
          <DebateBrief
            scenario={currentDebate.scenario}
            customerContext={currentDebate.customerContext}
            oracleTotal={oracleTotal}
            competitorTotal={competitorTotal}
            generationMeta={generationMeta}
          />

          <section className="grid items-stretch gap-4 xl:grid-cols-3">
            <AgentPanel agent={currentDebate.agents.oracle} />
            <AgentPanel agent={currentDebate.agents.competitor} />
            <AgentPanel agent={currentDebate.agents.judge} />
          </section>

          <section className="grid items-stretch gap-4 xl:grid-cols-[1fr_420px]">
            <ScoringSystem scores={currentDebate.scores} />
            <RecommendationSummary
              debate={currentDebate}
              oracleTotal={oracleTotal}
              competitorTotal={competitorTotal}
            />
          </section>
        </>
      ) : (
        <DebateEmptyState
          selectedUseCase={selectedUseCase}
          isLoadingSavedDebate={isLoadingSavedDebate}
        />
      )}
    </div>
  )
}

function DebateControls({
  catalogItems,
  selectedUseCaseId,
  selectedCompetitor,
  generationMeta,
  isGenerating,
  isLoadingSavedDebate,
  hasCurrentDebate,
  onSelectUseCase,
  onSelectCompetitor,
  onGenerate,
}: {
  catalogItems: UseCaseCatalogItem[]
  selectedUseCaseId: string
  selectedCompetitor: CompetitiveCompetitor
  generationMeta: DebateGenerationMeta
  isGenerating: boolean
  isLoadingSavedDebate: boolean
  hasCurrentDebate: boolean
  onSelectUseCase: (value: string) => void
  onSelectCompetitor: (value: CompetitiveCompetitor) => void
  onGenerate: () => void
}) {
  const canGenerate =
    Boolean(selectedUseCaseId) &&
    !hasCurrentDebate &&
    !isLoadingSavedDebate &&
    !isGenerating
  const competitorLocked = hasCurrentDebate || isLoadingSavedDebate || isGenerating
  const generateButtonLabel = isGenerating
    ? "Generating debate"
    : isLoadingSavedDebate
      ? "Checking saved debate"
      : hasCurrentDebate
        ? "Saved debate loaded"
        : "Generate debate"

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardContent className="grid gap-4 py-4 xl:grid-cols-[1fr_220px_auto] xl:items-end">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Use case context
          </div>
          <Select
            value={selectedUseCaseId}
            onValueChange={onSelectUseCase}
          >
            <SelectTrigger className="mt-2 w-full rounded-md bg-white">
              <SelectValue placeholder="Select a saved use case" />
            </SelectTrigger>
            <SelectContent>
              {catalogItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Competitor
          </div>
          <Select
            value={selectedCompetitor}
            disabled={competitorLocked}
            onValueChange={(value) =>
              onSelectCompetitor(value as CompetitiveCompetitor)
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
        <div className="group relative">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="w-full xl:w-auto"
            aria-describedby="debate-generation-model"
          >
            {isGenerating || isLoadingSavedDebate ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BrainCircuit className="size-4" />
            )}
            {generateButtonLabel}
          </Button>
          <div
            id="debate-generation-model"
            className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-72 rounded-md bg-slate-950 p-3 text-xs leading-5 text-white shadow-lg group-focus-within:block group-hover:block"
          >
            <div className="font-semibold">
              {generationMeta.mode === "llm" ? "OpenAI debate" : "Baseline draft"}
            </div>
            <div className="mt-1 text-slate-300">
              Model: {generationMeta.model ?? "not generated yet"}
            </div>
            <div className="text-slate-300">
              Reasoning: {generationMeta.reasoningEffort ?? "configured at generation"}
            </div>
          </div>
        </div>
        {generationMeta.warning ? (
          <p className="text-sm leading-6 text-slate-600 xl:col-span-3">
            {generationMeta.warning}
          </p>
        ) : null}
        {generationMeta.source === "database" && generationMeta.runId ? (
          <p className="text-sm leading-6 text-emerald-700 xl:col-span-3">
            Loaded a saved Debate Arena run from the database. Choose a use case
            with no saved debate to generate a new one.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DebateEmptyState({
  selectedUseCase,
  isLoadingSavedDebate,
}: {
  selectedUseCase?: UseCaseCatalogItem
  isLoadingSavedDebate: boolean
}) {
  const title = isLoadingSavedDebate
    ? "Checking saved Debate Arena runs"
    : selectedUseCase
      ? "No saved debate yet"
      : "Select a use case to start"
  const body = isLoadingSavedDebate
    ? "The workbench is checking whether this use case already has a Debate Arena result."
    : selectedUseCase
      ? "Generate the debate once, then the result will stay available for later review and architecture generation."
      : "Debate Arena will stay empty until you choose a saved customer scenario from the use case context menu."

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardContent className="flex min-h-72 flex-col items-center justify-center py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-md bg-slate-950 text-white">
          {isLoadingSavedDebate ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Scale className="size-5" />
          )}
        </span>
        <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{body}</p>
      </CardContent>
    </Card>
  )
}

function DebateBrief({
  scenario,
  customerContext,
  oracleTotal,
  competitorTotal,
  generationMeta,
}: {
  scenario: string
  customerContext: string
  oracleTotal: number
  competitorTotal: number
  generationMeta: Pick<
    DebateArenaGenerationResult,
    "mode" | "model" | "reasoningEffort"
  >
}) {
  return (
    <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
      <CardContent className="grid gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-md bg-red-600 text-white">
              Debate active
            </Badge>
            <Badge className="rounded-md bg-white text-slate-950">
              {generationMeta.mode === "llm" ? "LLM generated" : "Baseline draft"}
            </Badge>
            {generationMeta.model ? (
              <Badge className="rounded-md bg-white text-slate-950">
                {generationMeta.model}
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">{scenario}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            {customerContext}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-72">
          <ScoreTile label="Oracle" value={oracleTotal} tone="red" />
          <ScoreTile label="Competitor" value={competitorTotal} tone="blue" />
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-3">
      <div className="text-xs text-slate-300">{label}</div>
      <div className={cn("mt-1 text-3xl font-semibold", toneClass.text)}>
        {value}
      </div>
    </div>
  )
}

function AgentPanel({ agent }: { agent: DebateAgentPanel }) {
  const Icon = agentIcons[agent.role]
  const tone = getToneClasses(agent.tone)

  return (
    <Card className="h-full gap-0 rounded-md border-0 bg-white py-0 shadow-sm ring-slate-200">
      <CardHeader className="min-h-48 rounded-t-md border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-md ring-1",
              tone.soft
            )}
          >
            <Icon className="size-5" />
          </span>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {agent.confidence}% confidence
          </Badge>
        </div>
        <CardTitle className="pt-3 text-lg font-semibold text-slate-950">
          {getAgentPanelName(agent)}
        </CardTitle>
        <div className="space-y-1 text-sm text-slate-500">
          {agent.name !== getAgentPanelName(agent) ? <div>{agent.name}</div> : null}
          <div>{agent.title}</div>
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5" />
            {agent.organization}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 gap-4 p-4 xl:grid-rows-[minmax(150px,auto)_minmax(240px,auto)_1fr_1fr]">
        <PanelBlock
          icon={Target}
          title="Objective"
          body={agent.objective}
          className="h-full"
        />
        <PanelBlock
          icon={Bot}
          title={getAgentResponseTitle(agent)}
          body={agent.response}
          className="h-full"
        />
        <AgentList
          title="Key claims"
          items={agent.keyClaims}
          icon={CheckCircle2}
          className="h-full"
        />
        <AgentList
          title="Watch items"
          items={agent.watchItems}
          icon={TriangleAlert}
          className="h-full"
        />
      </CardContent>
    </Card>
  )
}

function getAgentPanelName(agent: DebateAgentPanel) {
  if (agent.role === "oracle") {
    return "Oracle Architect Agent"
  }

  if (agent.role === "competitor") {
    return "Competitor Architect Agent"
  }

  return "Neutral CTO Judge"
}

function getAgentResponseTitle(agent: DebateAgentPanel) {
  if (agent.role === "oracle") {
    return "Oracle Architect Response"
  }

  if (agent.role === "competitor") {
    return "Competitor Architect Response"
  }

  return "Judge's Evaluation"
}

function PanelBlock({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon: LucideIcon
  title: string
  body: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-slate-50 p-3",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Icon className="size-4 text-red-600" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  )
}

function AgentList({
  title,
  items,
  icon: Icon,
  className,
}: {
  title: string
  items: string[]
  icon: LucideIcon
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white p-3",
        className
      )}
    >
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <Icon className="mt-1 size-4 shrink-0 text-slate-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoringSystem({ scores }: { scores: DebateScore[] }) {
  return (
    <Card className="flex h-full flex-col rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Scoring system
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              Judge-weighted architecture scorecard
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <Scale className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {scores.map((score) => (
          <ScoreRow key={score.criterion} score={score} />
        ))}
      </CardContent>
    </Card>
  )
}

function ScoreRow({ score }: { score: DebateScore }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            {score.criterion}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Judge weight {score.judgeWeight}%
          </div>
        </div>
        <div className="flex gap-2">
          <ScoreBadge label="Oracle" score={score.oracleScore} tone="red" />
          <ScoreBadge label="Competitor" score={score.competitorScore} tone="blue" />
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <ScoreBar label="Oracle" score={score.oracleScore} tone="red" />
        <ScoreBar label="Competitor" score={score.competitorScore} tone="blue" />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {score.rationale}
      </p>
    </div>
  )
}

function ScoreBadge({
  label,
  score,
  tone,
}: {
  label: string
  score: number
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <Badge variant="outline" className={cn("rounded-md bg-white", toneClass.text)}>
      {label} {score}
    </Badge>
  )
}

function ScoreBar({
  label,
  score,
  tone,
}: {
  label: string
  score: number
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="grid grid-cols-[88px_1fr_36px] items-center gap-2 text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="h-2 rounded-full bg-white">
        <span
          className={cn("block h-full rounded-full", toneClass.accent)}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="text-right font-semibold text-slate-700">{score}</span>
    </div>
  )
}

function RecommendationSummary({
  debate,
  oracleTotal,
  competitorTotal,
}: {
  debate: ArchitectureDebate
  oracleTotal: number
  competitorTotal: number
}) {
  const recommendation = debate.recommendation

  return (
    <Card className="flex h-full flex-col rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Architecture recommendation summary
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              {recommendation.verdict}
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white">
            <Gavel className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Gauge className="size-4 text-red-600" />
            Judge summary
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation.summary}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-950">
            Recommended architecture
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation.recommendedArchitecture}
          </p>
        </div>

        <RecommendationList
          title="Why Oracle"
          items={recommendation.whyOracle}
          icon={ShieldCheck}
          tone="emerald"
        />
        <RecommendationList
          title="Risks to resolve"
          items={recommendation.risksToResolve}
          icon={TriangleAlert}
          tone="amber"
        />
        <RecommendationList
          title="Next steps"
          items={recommendation.nextSteps}
          icon={ArrowRight}
          tone="blue"
        />
        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
          <SummaryScore label="Oracle" score={oracleTotal} tone="red" />
          <SummaryScore label="Competitor" score={competitorTotal} tone="blue" />
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryScore({
  label,
  score,
  tone,
}: {
  label: string
  score: number
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={cn("mt-1 text-3xl font-semibold", toneClass.text)}>
        {score}
      </div>
    </div>
  )
}

function RecommendationList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string
  items: string[]
  icon: LucideIcon
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div>
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ring-1",
                toneClass.soft
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function weightedScore(items: Array<{ score: number; weight: number }>) {
  const totalWeight = items.reduce((total, item) => total + item.weight, 0)
  const weightedTotal = items.reduce(
    (total, item) => total + item.score * item.weight,
    0
  )

  return Math.round(weightedTotal / totalWeight)
}

async function fetchLatestSavedDebate(useCaseId: string) {
  const response = await fetch(
    `/api/debate-runs?useCaseId=${encodeURIComponent(useCaseId)}&limit=1`
  )

  if (!response.ok) {
    throw new Error("Unable to load saved Debate Arena runs.")
  }

  return (await response.json()) as DebateRunsApiResponse
}

function createDebateInput({
  baseline,
  selectedUseCase,
  selectedCompetitor,
}: {
  baseline: ArchitectureDebate
  selectedUseCase?: UseCaseCatalogItem
  selectedCompetitor: CompetitiveCompetitor
}): DebateArenaGenerationInput {
  if (!selectedUseCase) {
    return {
      scenario: baseline.scenario,
      customerContext: baseline.customerContext,
      competitor: selectedCompetitor,
      domain: "lakehouse-modernization",
      discoveryConfidence: "Directional",
    }
  }

  return {
    useCaseId: selectedUseCase.id,
    scenario: selectedUseCase.title,
    customerContext: selectedUseCase.input.prompt,
    competitor: selectedCompetitor,
    domain: selectedUseCase.input.domain,
    discoveryConfidence: selectedUseCase.input.discoveryConfidence,
    assistBrief:
      selectedUseCase.input.competitor === selectedCompetitor
        ? selectedUseCase.brief
        : undefined,
  }
}
