"use client"

import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BrainCircuit,
  CircleHelp,
  FileText,
  Layers3,
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
import { cn } from "@/lib/utils"
import type {
  CompetitiveAssistBrief,
  CompetitiveAssistInput,
  CompetitiveCompetitor,
  StrategyDomain,
  WorkbenchTone,
} from "@/types/workbench"

export function CompetitiveAssistWorkspace() {
  const [activeSignalId, setActiveSignalId] = useState(customerSignalChips[0].id)
  const [input, setInput] = useState<CompetitiveAssistInput>(
    customerSignalChips[0].input
  )
  const [submittedInput, setSubmittedInput] =
    useState<CompetitiveAssistInput>(input)

  const brief = useMemo(
    () => generateCompetitiveAssistBrief(submittedInput),
    [submittedInput]
  )

  function updateInput<K extends keyof CompetitiveAssistInput>(
    key: K,
    value: CompetitiveAssistInput[K]
  ) {
    setInput((current) => ({ ...current, [key]: value }))
    setActiveSignalId("custom")
  }

  function applySignalChip(signalId: string) {
    const signal = customerSignalChips.find((item) => item.id === signalId)

    if (!signal) {
      return
    }

    setActiveSignalId(signal.id)
    setInput(signal.input)
    setSubmittedInput(signal.input)
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
            Capture the weak customer signal, select the competitive context,
            and generate a concise field-ready assist.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-950">
              Competitor selector
            </div>
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
              Customer signal chips
            </div>
            <div className="mt-2 grid gap-2">
              {customerSignalChips.map((signal) => {
                const isActive = activeSignalId === signal.id

                return (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => applySignalChip(signal.id)}
                    className={cn(
                      "rounded-md border p-3 text-left transition-colors",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    )}
                  >
                    <span className="block text-sm font-semibold">
                      {signal.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-xs leading-5",
                        isActive ? "text-slate-300" : "text-slate-500"
                      )}
                    >
                      {signal.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="customer-signal"
              className="text-sm font-semibold text-slate-950"
            >
              Raw customer signal
            </label>
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
              <div className="mt-2 grid grid-cols-3 gap-2">
                {discoveryConfidenceLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateInput("discoveryConfidence", level)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      input.discoveryConfidence === level
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={() => setSubmittedInput(input)}>
            <WandSparkles className="size-4" />
            Generate field assist
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <AssistCommandBar brief={brief} />

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <ConsolePanel
            title="Discovery question generator"
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

        <section className="grid gap-4 xl:grid-cols-2">
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

        <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <BattleCardOutput brief={brief} />
          <div className="grid gap-4">
            <HandoffCard
              title="Debate Arena"
              icon={BrainCircuit}
              description={brief.feeds.debateArena}
              status="Agent prompts ready"
            />
            <HandoffCard
              title="Architecture Generator"
              icon={Layers3}
              description={brief.feeds.architectureGenerator}
              status="Blueprint inputs ready"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function AssistCommandBar({ brief }: { brief: CompetitiveAssistBrief }) {
  return (
    <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
      <CardContent className="grid gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-md bg-white text-slate-950">
              {brief.competitor}
            </Badge>
            <Badge className="rounded-md bg-red-600 text-white">
              {brief.discoveryConfidence} discovery
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
        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
          <ReadinessStat label="Priorities" value={brief.inferredPriorities.length} />
          <ReadinessStat label="Battle card points" value={brief.battleCardGuidance.length} />
        </div>
      </CardContent>
    </Card>
  )
}

function ReadinessStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-3">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
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
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
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
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
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
          <div key={row.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
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

function HandoffCard({
  title,
  icon: Icon,
  description,
  status,
}: {
  title: string
  icon: LucideIcon
  description: string
  status: string
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <Icon className="size-5" />
          </span>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {status}
          </Badge>
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-700">
          Route output
          <ArrowRight className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
