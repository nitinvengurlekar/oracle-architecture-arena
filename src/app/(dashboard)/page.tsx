import {
  Blocks,
  BrainCircuit,
  ClipboardList,
  ShieldCheck,
} from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { CompetitiveAssistPanel } from "@/components/dashboard/competitive-assist-panel"
import { DomainCard } from "@/components/dashboard/domain-card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { ScenarioCard } from "@/components/dashboard/scenario-card"
import { Scoreboard } from "@/components/dashboard/scoreboard"
import { Button } from "@/components/ui/button"
import {
  architectureScoreboard,
  competitiveAssistBrief,
  executiveMetrics,
  scenarios,
  strategyDomains,
} from "@/data/mock-workbench"

const metricIcons = [ClipboardList, BrainCircuit, Blocks, ShieldCheck]

export default function DashboardPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Oracle Architecture Arena"
        title="Executive architecture decision workbench"
        description="Coordinate modernization pursuits, competitive discovery, AI strategy, and sovereign deployment decisions from one operating surface."
        actions={
          <>
            <Button variant="outline">Export brief</Button>
            <Button>New scenario</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            icon={metricIcons[index]}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {strategyDomains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {scenarios.slice(0, 2).map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
        <Scoreboard title="Readiness scoreboard" items={architectureScoreboard} />
      </section>

      <CompetitiveAssistPanel brief={competitiveAssistBrief} />
    </AnimatedPage>
  )
}
