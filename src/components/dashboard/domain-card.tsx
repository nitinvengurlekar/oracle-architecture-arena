import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { StrategyDomainSummary } from "@/types/workbench"

export function DomainCard({ domain }: { domain: StrategyDomainSummary }) {
  const tone = getToneClasses(domain.tone)

  return (
    <Card className={cn("rounded-md border-0 bg-white shadow-sm", tone.border)}>
      <CardHeader className="rounded-t-md">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("h-2 w-10 rounded-full", tone.accent)} />
          <Badge variant="outline" className="rounded-md bg-white">
            {domain.executivePriority}% priority
          </Badge>
        </div>
        <CardTitle className="pt-2 text-base font-semibold text-slate-950">
          {domain.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="min-h-12 text-sm leading-6 text-slate-600">
          {domain.description}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Active</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">
              {domain.activeScenarios}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Signal</div>
            <div className="mt-1 text-sm font-medium leading-5 text-slate-800">
              {domain.signal}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
