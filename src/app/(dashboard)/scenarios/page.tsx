import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { ScenariosWorkspace } from "@/components/dashboard/scenarios-workspace"
import { Button } from "@/components/ui/button"
import { scenarios } from "@/data/mock-workbench"
import Link from "next/link"

export default function ScenariosPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Use case catalog"
        title="Saved pursuit workbench"
        description="Revisit generated SE Assist outputs, review battle-card guidance, and reopen prior customer use cases from this browser."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/competitive-se-assist">Import signal</Link>
            </Button>
            <Button asChild>
              <Link href="/competitive-se-assist">Create scenario</Link>
            </Button>
          </>
        }
      />

      <ScenariosWorkspace scenarios={scenarios} />
    </AnimatedPage>
  )
}
