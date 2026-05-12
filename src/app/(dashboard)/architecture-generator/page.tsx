import { AnimatedPage } from "@/components/dashboard/animated-page"
import { ArchitectureGeneratorWorkspace } from "@/components/dashboard/architecture-generator-workspace"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  architectureDebate,
  generatedArchitectureBlueprint,
} from "@/data/mock-workbench"
import {
  smokeTestArchitectureBlueprint,
  smokeTestArchitectureDebate,
} from "@/data/smoke-test-fixtures"

const architectureHistory = [
  {
    id: smokeTestArchitectureBlueprint.id,
    label: "Smoke test: Transportation authority",
    description:
      "Seeded smoke-test architecture with Oracle Exadata, AWS, Databricks, Tableau, Looker, and public-sector controls.",
    generatedAt: "2026-05-11",
    blueprint: smokeTestArchitectureBlueprint,
    recommendation: smokeTestArchitectureDebate.recommendation,
  },
  {
    id: generatedArchitectureBlueprint.id,
    label: "Baseline: Databricks lakehouse",
    description:
      "Original demo architecture for governed Oracle lakehouse modernization.",
    generatedAt: "Baseline demo",
    blueprint: generatedArchitectureBlueprint,
    recommendation: architectureDebate.recommendation,
  },
]

export default function ArchitectureGeneratorPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="Architecture Generator"
        title="Blueprint draft from strategy signals"
        description="Transform competitive discovery, debate findings, and whiteboard inputs into an editable Oracle modernization architecture with explicit governance and business outcomes."
      />

      <ArchitectureGeneratorWorkspace
        blueprint={smokeTestArchitectureBlueprint}
        recommendation={smokeTestArchitectureDebate.recommendation}
        history={architectureHistory}
      />
    </AnimatedPage>
  )
}
