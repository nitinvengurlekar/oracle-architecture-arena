import { AnimatedPage } from "@/components/dashboard/animated-page"
import { DebateArenaWorkspace } from "@/components/dashboard/debate-arena-workspace"
import { PageHeader } from "@/components/dashboard/page-header"
import { smokeTestArchitectureDebate } from "@/data/smoke-test-fixtures"

export default function DebateArenaPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Debate Arena"
        title="Multi-agent strategy review"
        description="Coordinate modernization, AI platform, economics, security, and sovereign deployment perspectives before a solution path is promoted to architecture generation."
      />

      <DebateArenaWorkspace debate={smokeTestArchitectureDebate} />
    </AnimatedPage>
  )
}
