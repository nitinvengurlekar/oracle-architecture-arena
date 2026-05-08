import { AnimatedPage } from "@/components/dashboard/animated-page"
import { ArchitectureGeneratorWorkspace } from "@/components/dashboard/architecture-generator-workspace"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  architectureDebate,
  generatedArchitectureBlueprint,
} from "@/data/mock-workbench"

export default function ArchitectureGeneratorPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Architecture Generator"
        title="Blueprint draft from strategy signals"
        description="Transform competitive discovery, debate findings, and whiteboard inputs into an editable Oracle modernization architecture with explicit governance and business outcomes."
      />

      <ArchitectureGeneratorWorkspace
        blueprint={generatedArchitectureBlueprint}
        recommendation={architectureDebate.recommendation}
      />
    </AnimatedPage>
  )
}
