"use client"

import Link from "next/link"
import {
  ArrowRight,
  BrainCircuit,
  Download,
  Map,
  PencilRuler,
  Plus,
  Sparkles,
  Swords,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type {
  ArchitectureDebate,
  ArchitectureGeneratorBlueprint,
  CompetitiveAssistBrief,
  Scenario,
  WhiteboardNote,
  WorkbenchTone,
} from "@/types/workbench"

type DashboardBrief = {
  scenario: Scenario
  assistBrief: CompetitiveAssistBrief
  debate: ArchitectureDebate
  blueprint: ArchitectureGeneratorBlueprint
  whiteboardNotes: WhiteboardNote[]
}

const workflowSteps = [
  {
    title: "Capture customer signal",
    description: "Start with the incomplete customer statement or competitor cue.",
    href: "/competitive-se-assist",
    icon: Swords,
    tone: "red",
  },
  {
    title: "Generate field assist",
    description: "Infer priorities, discovery questions, positioning, and risks.",
    href: "/competitive-se-assist",
    icon: Sparkles,
    tone: "blue",
  },
  {
    title: "Run architecture debate",
    description: "Compare Oracle, competitor, and neutral CTO perspectives.",
    href: "/debate-arena",
    icon: BrainCircuit,
    tone: "violet",
  },
  {
    title: "Generate blueprint",
    description: "Convert the recommendation into editable OCI architecture.",
    href: "/architecture-generator",
    icon: PencilRuler,
    tone: "emerald",
  },
] satisfies Array<{
  title: string
  description: string
  href: string
  icon: LucideIcon
  tone: WorkbenchTone
}>

export function DashboardActions({ brief }: { brief: DashboardBrief }) {
  return (
    <>
      <Button variant="outline" onClick={() => exportDashboardBrief(brief)}>
        <Download className="size-4" />
        Export brief
      </Button>
      <Button asChild>
        <Link href="/competitive-se-assist">
          <Plus className="size-4" />
          New scenario
        </Link>
      </Button>
    </>
  )
}

export function DashboardStartWorkspace({ brief }: { brief: DashboardBrief }) {
  const { scenario } = brief

  return (
    <div className="grid gap-4">
      <section>
        <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
          <CardContent className="grid gap-4 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-md bg-red-600 text-white">
                  Start here
                </Badge>
                <Badge className="rounded-md bg-white text-slate-950">
                  {scenario.stage}
                </Badge>
                <Badge className="rounded-md bg-white text-slate-950">
                  {scenario.competitor} compete
                </Badge>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {scenario.title}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                {scenario.customerSignal}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Recommended next action: {scenario.nextAction}
              </p>
            </div>
            <div className="grid gap-2 lg:w-56">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link href="/competitive-se-assist">
                  <Swords className="size-4" />
                  Start Competitive Assist
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white text-slate-950 hover:bg-slate-100"
              >
                <Link href="/scenarios">
                  <Map className="size-4" />
                  View scenarios
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
          <CardHeader className="rounded-t-md border-b border-slate-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recommended workflow
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              Customer signal to architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {workflowSteps.map((step) => (
              <WorkflowStep key={step.title} step={step} />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function WorkflowStep({
  step,
}: {
  step: (typeof workflowSteps)[number]
}) {
  const tone = getToneClasses(step.tone)
  const Icon = step.icon

  return (
    <Link
      href={step.href}
      className="rounded-md border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md ring-1",
            tone.soft
          )}
        >
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-slate-400" />
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-950">
        {step.title}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {step.description}
      </p>
    </Link>
  )
}

function exportDashboardBrief({
  scenario,
  assistBrief,
  debate,
  blueprint,
  whiteboardNotes,
}: DashboardBrief) {
  const markdown = [
    "# Oracle Architecture Arena Brief",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Current Scenario",
    `- Title: ${scenario.title}`,
    `- Account: ${scenario.account}`,
    `- Competitor: ${scenario.competitor}`,
    `- Stage: ${scenario.stage}`,
    `- Risk: ${scenario.risk}`,
    `- Customer signal: ${scenario.customerSignal}`,
    "",
    "## Competitive SE Assist",
    `- Battle-card headline: ${assistBrief.battleCardOutput.headline}`,
    `- Oracle position: ${assistBrief.battleCardOutput.oraclePosition}`,
    `- Next move: ${assistBrief.battleCardOutput.nextMove}`,
    "",
    "## Debate Arena",
    `- Verdict: ${debate.recommendation.verdict}`,
    `- Summary: ${debate.recommendation.summary}`,
    "",
    "## Architecture Generator",
    `- Blueprint: ${blueprint.title}`,
    `- Confidence: ${blueprint.confidence}%`,
    `- Summary: ${blueprint.summary}`,
    "",
    "## Whiteboard Studio",
    `- Structured notes: ${whiteboardNotes.length}`,
    "",
    "## Recommended Workflow",
    "1. Start in Competitive SE Assist.",
    "2. Feed the assist into Debate Arena.",
    "3. Generate an architecture blueprint.",
    "4. Use Whiteboard Studio for sketches and notes.",
    "",
  ].join("\n")

  const blob = new Blob([markdown], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = "oracle-architecture-arena-brief.md"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
