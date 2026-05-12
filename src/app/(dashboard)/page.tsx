import { AnimatedPage } from "@/components/dashboard/animated-page"
import {
  DashboardActions,
  DashboardStartWorkspace,
} from "@/components/dashboard/dashboard-start-workspace"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  architectureDebate,
  competitiveAssistBrief,
  generatedArchitectureBlueprint,
  scenarios,
  whiteboardNotes,
} from "@/data/mock-workbench"

export default function DashboardPage() {
  const dashboardBrief = {
    scenario: scenarios[0],
    assistBrief: competitiveAssistBrief,
    debate: architectureDebate,
    blueprint: generatedArchitectureBlueprint,
    whiteboardNotes,
  }

  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Oracle Architecture Arena"
        title="Start with a customer signal"
        description="Use the workbench as a guided path from incomplete competitive context to discovery questions, architecture debate, blueprint generation, and whiteboard notes."
        actions={<DashboardActions brief={dashboardBrief} />}
      />

      <DashboardStartWorkspace brief={dashboardBrief} />
    </AnimatedPage>
  )
}
