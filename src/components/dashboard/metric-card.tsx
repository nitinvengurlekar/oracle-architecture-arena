import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { ExecutiveMetric } from "@/types/workbench"

export function MetricCard({
  metric,
  icon: Icon,
}: {
  metric: ExecutiveMetric
  icon: LucideIcon
}) {
  const tone = getToneClasses(metric.tone)

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between gap-3 rounded-t-md pb-0">
        <CardTitle className="text-sm font-medium text-slate-600">
          {metric.label}
        </CardTitle>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-md ring-1",
            tone.soft
          )}
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-slate-950">
          {metric.value}
        </div>
        <p className="mt-1 text-sm text-slate-500">{metric.change}</p>
      </CardContent>
    </Card>
  )
}
