import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  DatabaseZap,
  Gavel,
  Gauge,
  Scale,
  ShieldCheck,
  Swords,
  Target,
  TriangleAlert,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type {
  ArchitectureDebate,
  DebateAgentPanel,
  DebateScore,
  WorkbenchTone,
} from "@/types/workbench"

const agentIcons = {
  oracle: DatabaseZap,
  competitor: Swords,
  judge: Gavel,
} satisfies Record<DebateAgentPanel["role"], LucideIcon>

export function DebateArenaWorkspace({
  debate,
}: {
  debate: ArchitectureDebate
}) {
  const oracleTotal = weightedScore(
    debate.scores.map((score) => ({
      score: score.oracleScore,
      weight: score.judgeWeight,
    }))
  )
  const competitorTotal = weightedScore(
    debate.scores.map((score) => ({
      score: score.competitorScore,
      weight: score.judgeWeight,
    }))
  )

  return (
    <div className="flex flex-col gap-4">
      <DebateBrief
        scenario={debate.scenario}
        customerContext={debate.customerContext}
        oracleTotal={oracleTotal}
        competitorTotal={competitorTotal}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <AgentPanel agent={debate.agents.oracle} />
        <AgentPanel agent={debate.agents.competitor} />
        <AgentPanel agent={debate.agents.judge} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <ScoringSystem scores={debate.scores} />
        <RecommendationSummary
          debate={debate}
          oracleTotal={oracleTotal}
          competitorTotal={competitorTotal}
        />
      </section>
    </div>
  )
}

function DebateBrief({
  scenario,
  customerContext,
  oracleTotal,
  competitorTotal,
}: {
  scenario: string
  customerContext: string
  oracleTotal: number
  competitorTotal: number
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
              Mock AI responses
            </Badge>
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
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
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
          {agent.name}
        </CardTitle>
        <div className="space-y-1 text-sm text-slate-500">
          <div>{agent.title}</div>
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5" />
            {agent.organization}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PanelBlock
          icon={Target}
          title="Objective"
          body={agent.objective}
        />
        <PanelBlock
          icon={Bot}
          title="Mock AI response"
          body={agent.response}
        />
        <AgentList title="Key claims" items={agent.keyClaims} icon={CheckCircle2} />
        <AgentList title="Watch items" items={agent.watchItems} icon={TriangleAlert} />
      </CardContent>
    </Card>
  )
}

function PanelBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
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
}: {
  title: string
  items: string[]
  icon: LucideIcon
}) {
  return (
    <div>
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
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
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
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SummaryScore label="Oracle" score={oracleTotal} tone="red" />
          <SummaryScore label="Competitor" score={competitorTotal} tone="blue" />
        </div>

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
