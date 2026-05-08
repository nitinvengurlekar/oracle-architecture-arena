import { MessageSquareText } from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { Scoreboard } from "@/components/dashboard/scoreboard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { architectureScoreboard, debateAgents } from "@/data/mock-workbench"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"

export default function DebateArenaPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Debate Arena"
        title="Multi-agent strategy review"
        description="Coordinate modernization, AI platform, economics, security, and sovereign deployment perspectives before a solution path is promoted to architecture generation."
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {debateAgents.map((agent) => {
            const tone = getToneClasses(agent.tone)

            return (
              <Card
                key={agent.id}
                className="rounded-md border-0 bg-white shadow-sm ring-slate-200"
              >
                <CardHeader className="rounded-t-md">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-md ring-1",
                        tone.soft
                      )}
                    >
                      <MessageSquareText className="size-5" />
                    </span>
                    <Badge variant="outline" className="rounded-md bg-white">
                      {agent.score} confidence
                    </Badge>
                  </div>
                  <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
                    {agent.name}
                  </CardTitle>
                  <div className="text-sm text-slate-500">{agent.role}</div>
                </CardHeader>
                <CardContent>
                  <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {agent.stance}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Scoreboard title="Debate outputs" items={architectureScoreboard} />
      </section>
    </AnimatedPage>
  )
}
