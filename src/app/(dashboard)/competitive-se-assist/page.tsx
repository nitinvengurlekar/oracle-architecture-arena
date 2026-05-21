import { Suspense } from "react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { CompetitiveAssistWorkspace } from "@/components/dashboard/competitive-assist-workspace"
import { PageHeader } from "@/components/dashboard/page-header"

export default function CompetitiveSeAssistPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Competitive SE Assist"
        title="Build strategy from customer context"
        description="Use the SE Assistant and Discovery Agent to infer priorities, identify Oracle positioning, and translate competitive context into field guidance."
      />

      <Suspense fallback={null}>
        <CompetitiveAssistWorkspace />
      </Suspense>
    </AnimatedPage>
  )
}
