import { ArrowRight, CircleAlert } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Scenario } from "@/types/workbench"

export function ScenarioCard({
  scenario,
  href = "/competitive-se-assist",
}: {
  scenario: Scenario
  href?: string
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {scenario.stage}
          </Badge>
          <Badge
            variant={scenario.risk === "Critical" ? "destructive" : "secondary"}
            className="rounded-md"
          >
            {scenario.risk} risk
          </Badge>
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          {scenario.title}
        </CardTitle>
        <div className="text-sm text-slate-500">
          {scenario.account} / {scenario.competitor}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {scenario.customerSignal}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Priority score
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">
              {scenario.priorityScore}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {scenario.drivers.map((driver) => (
              <Badge key={driver} variant="outline" className="rounded-md bg-white">
                {driver}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="items-start gap-3 rounded-b-md bg-white">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="flex-1 text-sm leading-6 text-slate-600">
          {scenario.nextAction}
        </p>
        <Button asChild variant="ghost" size="icon-sm">
          <Link href={href} aria-label={`Open ${scenario.title}`}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
