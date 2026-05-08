import { CheckCircle2 } from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { WhiteboardCanvasPreview } from "@/components/dashboard/whiteboard-canvas-preview"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { whiteboardSignals } from "@/data/mock-workbench"
import { getToneClasses } from "@/lib/tone"
import { cn } from "@/lib/utils"

export default function WhiteboardStudioPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Whiteboard Studio"
        title="Sketch-to-architecture workspace"
        description="Capture early solution ideas, customer-drawn flows, and architecture notes before converting them into structured debate and generator inputs."
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <WhiteboardCanvasPreview />
        <div className="flex flex-col gap-4">
          {whiteboardSignals.map((signal) => {
            const tone = getToneClasses(signal.tone)

            return (
              <Card
                key={signal.title}
                className="rounded-md border-0 bg-white shadow-sm ring-slate-200"
              >
                <CardHeader className="rounded-t-md">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md ring-1",
                        tone.soft
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                    </span>
                    <Badge variant="outline" className="rounded-md bg-slate-50">
                      {signal.status}
                    </Badge>
                  </div>
                  <CardTitle className="pt-2 text-base font-semibold text-slate-950">
                    {signal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">
                    {signal.detail}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </AnimatedPage>
  )
}
