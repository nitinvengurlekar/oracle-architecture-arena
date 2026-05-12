import { AnimatedPage } from "@/components/dashboard/animated-page"
import { CompetitiveAssistWorkspace } from "@/components/dashboard/competitive-assist-workspace"
import { PageHeader } from "@/components/dashboard/page-header"

export default function CompetitiveSeAssistPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Competitive SE Assist"
        title="Guidance when customer context is incomplete"
        description="Use the SE Assistant and Discovery Agent to infer likely priorities, expose gaps, identify Oracle positioning, and translate competitive context into field guidance."
      />

      <CompetitiveAssistWorkspace />
    </AnimatedPage>
  )
}
