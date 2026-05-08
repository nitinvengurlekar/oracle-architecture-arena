import { Database, ShieldCheck } from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { ArchitectureFlowPreview } from "@/components/dashboard/architecture-flow-preview"
import { PageHeader } from "@/components/dashboard/page-header"
import { Scoreboard } from "@/components/dashboard/scoreboard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  architectureEdges,
  architectureNodes,
  architectureScoreboard,
} from "@/data/mock-workbench"

export default function ArchitectureGeneratorPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Architecture Generator"
        title="Blueprint draft from strategy signals"
        description="Transform competitive discovery, debate findings, and whiteboard inputs into an editable Oracle modernization architecture with explicit governance and business outcomes."
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ArchitectureFlowPreview
          nodes={architectureNodes}
          edges={architectureEdges}
        />
        <div className="flex flex-col gap-4">
          <Scoreboard title="Blueprint quality" items={architectureScoreboard} />
          <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
            <CardHeader className="rounded-t-md">
              <CardTitle className="text-base font-semibold text-slate-950">
                Generator inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <Database className="mt-0.5 size-4 shrink-0 text-red-600" />
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    Data gravity
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Oracle systems of record anchor the first blueprint draft.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    Governance model
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Residency, audit, and access controls remain attached to
                    every generated architecture.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-md bg-white">
                ReactFlow preview connected
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>
    </AnimatedPage>
  )
}
