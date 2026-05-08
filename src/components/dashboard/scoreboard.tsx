import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { ScoreboardItem } from "@/types/workbench"

export function Scoreboard({
  title,
  items,
}: {
  title: string
  items: ScoreboardItem[]
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <CardTitle className="text-base font-semibold text-slate-950">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const tone = getToneClasses(item.tone)
          const width = `${Math.min(item.score, 100)}%`

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    Target {item.target}
                  </div>
                </div>
                <div className={cn("text-lg font-semibold", tone.text)}>
                  {item.score}
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", tone.accent)}
                  style={{ width }}
                />
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                {item.insight}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
