import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitiveAssistBrief } from "@/types/workbench"

function InsightList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CompetitiveAssistPanel({
  brief,
}: {
  brief: CompetitiveAssistBrief
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-md bg-red-600 text-white">
            Competitive SE Assist
          </Badge>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            Incomplete discovery
          </Badge>
        </div>
        <CardTitle className="pt-2 text-xl font-semibold text-slate-950">
          {brief.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightList title="Likely customer priorities" items={brief.inferredPriorities} />
          <InsightList title="Discovery questions" items={brief.discoveryQuestions} />
          <InsightList title="Oracle positioning opportunities" items={brief.oracleOpportunities} />
          <InsightList title="Competitor strengths and risks" items={[...brief.competitorStrengths, ...brief.competitorRisks]} />
        </div>
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-950 p-4 text-white">
          <div className="text-sm font-semibold">Battle-card guidance</div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {brief.battleCardGuidance.map((item) => (
              <div key={item} className="rounded-md bg-white/10 p-3 text-sm leading-6 text-slate-100">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm md:grid-cols-2">
            <div className="flex gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-red-300" />
              <span>{brief.feeds.debateArena}</span>
            </div>
            <div className="flex gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-red-300" />
              <span>{brief.feeds.architectureGenerator}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
