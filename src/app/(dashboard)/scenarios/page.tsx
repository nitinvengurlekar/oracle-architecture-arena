import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { ScenarioCard } from "@/components/dashboard/scenario-card"
import { Scoreboard } from "@/components/dashboard/scoreboard"
import { Button } from "@/components/ui/button"
import { architectureScoreboard, scenarios } from "@/data/mock-workbench"

export default function ScenariosPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Scenario command center"
        title="Strategic pursuit library"
        description="Track modernization, AI, lakehouse, and sovereign deployment scenarios with customer signal, competitor context, risk level, and next action visible at a glance."
        actions={
          <>
            <Button variant="outline">Import signal</Button>
            <Button>Create scenario</Button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
        <Scoreboard title="Scenario readiness" items={architectureScoreboard} />
      </section>
    </AnimatedPage>
  )
}
