import { ArrowRight, BrainCircuit, Layers3 } from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { CompetitiveAssistPanel } from "@/components/dashboard/competitive-assist-panel"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { competitiveAssistBrief } from "@/data/mock-workbench"

const handoffLanes = [
  {
    title: "Debate Arena feed",
    icon: BrainCircuit,
    description: competitiveAssistBrief.feeds.debateArena,
    status: "Agent prompts ready",
  },
  {
    title: "Architecture Generator feed",
    icon: Layers3,
    description: competitiveAssistBrief.feeds.architectureGenerator,
    status: "Blueprint inputs ready",
  },
]

export default function CompetitiveSeAssistPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Competitive SE Assist"
        title="Guidance when customer discovery is incomplete"
        description="Infer likely priorities, expose gaps, identify Oracle positioning, and translate competitive context into battle-card guidance for the rest of the workbench."
      />

      <CompetitiveAssistPanel brief={competitiveAssistBrief} />

      <section className="grid gap-4 lg:grid-cols-2">
        {handoffLanes.map((lane) => {
          const Icon = lane.icon

          return (
            <Card
              key={lane.title}
              className="rounded-md border-0 bg-white shadow-sm ring-slate-200"
            >
              <CardHeader className="rounded-t-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant="outline" className="rounded-md bg-slate-50">
                    {lane.status}
                  </Badge>
                </div>
                <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
                  {lane.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {lane.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-700">
                  Route output
                  <ArrowRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </AnimatedPage>
  )
}
