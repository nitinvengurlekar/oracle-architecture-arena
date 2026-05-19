import type {
  ArchitectureGeneratorBlueprint,
  ArchitectureRecommendation,
  CompetitiveCompetitor,
  StrategyDomain,
  UseCaseCatalogItem,
} from "@/types/workbench"

const competitorPlatformLabels = {
  Databricks: "Databricks challenge lane",
  Snowflake: "Snowflake analytics challenge lane",
  AWS: "AWS modernization challenge lane",
  Azure: "Azure Government challenge lane",
  "Google Cloud": "Google Cloud AI challenge lane",
  Other: "Competitor challenge lane",
} satisfies Record<CompetitiveCompetitor, string>

const domainPlatformLabels = {
  "database-modernization": "Autonomous Database modernization core",
  "ai-ml-platform": "OCI AI and vector search platform",
  "lakehouse-modernization": "Governed lakehouse modernization core",
  "sovereign-deployment": "Sovereign OCI deployment core",
} satisfies Record<StrategyDomain, string>

const domainServices = {
  "database-modernization": "Autonomous Database / Exadata Cloud",
  "ai-ml-platform": "OCI Generative AI + AI Vector Search",
  "lakehouse-modernization": "Autonomous Data Warehouse + OCI Data Lake",
  "sovereign-deployment": "OCI Dedicated Region / Sovereign Controls",
} satisfies Record<StrategyDomain, string>

export function createArchitectureBlueprintFromUseCase({
  useCase,
  recommendation,
}: {
  useCase: UseCaseCatalogItem
  recommendation?: ArchitectureRecommendation
}) {
  const architectureRecommendation =
    recommendation ?? createRecommendationFromAssist(useCase)
  const domainLabel = domainPlatformLabels[useCase.input.domain]
  const competitorLabel = competitorPlatformLabels[useCase.input.competitor]
  const sourceLabel = inferSourceLabel(useCase.input.prompt)
  const id = `blueprint-${useCase.id}`

  const blueprint: ArchitectureGeneratorBlueprint = {
    id,
    title: `${useCase.title} Architecture Blueprint`,
    generatedFrom: useCase.title,
    summary:
      architectureRecommendation.summary ||
      `Oracle-led architecture draft for ${useCase.title}.`,
    recommendationSource: recommendation
      ? "Latest Debate Arena recommendation"
      : "Competitive SE Assist recommendation",
    confidence: useCase.input.discoveryConfidence === "Validated" ? 88 : 78,
    nodes: [
      {
        id: "oracle-systems-of-record",
        label: sourceLabel,
        type: "input",
        detail:
          "Authoritative operational systems remain the trusted source for records, transactions, security controls, and audit evidence.",
        x: 0,
        y: 80,
        ociService: "Oracle systems of record",
        layer: "Source systems",
        rationale:
          "The customer context identifies Oracle as a durable system of record, so the architecture starts with operational truth rather than a duplicate analytics copy.",
        status: "Generated",
        tone: "red",
      },
      {
        id: "governed-integration",
        label: "Governed data integration",
        type: "platform",
        detail:
          "Move and expose data with explicit freshness, lineage, access control, and operational ownership.",
        x: 340,
        y: 80,
        ociService: "GoldenGate / OCI Data Integration",
        layer: "Integration",
        rationale:
          "The architecture needs controlled movement from Oracle records into analytics and AI experiences without losing lineage or freshness discipline.",
        status: "Generated",
        tone: "amber",
      },
      {
        id: "oracle-modernization-core",
        label: domainLabel,
        type: "service",
        detail: architectureRecommendation.recommendedArchitecture,
        x: 690,
        y: 80,
        ociService: domainServices[useCase.input.domain],
        layer: "Oracle modernization platform",
        rationale:
          "This node reflects the primary Oracle modernization path implied by the selected strategy domain and Debate Arena recommendation.",
        status: "Generated",
        tone: "blue",
      },
      {
        id: "governance-control-plane",
        label: "Policy, audit, and sovereignty controls",
        type: "governance",
        detail:
          "Centralize security, retention, access policy, observability, model governance, and evidence for architecture review.",
        x: 690,
        y: 330,
        ociService: "OCI IAM / Cloud Guard / Audit",
        layer: "Governance",
        rationale:
          "Governance must be visible in the first draft because the app targets regulated enterprise and government architecture teams.",
        status: "Review",
        tone: "emerald",
      },
      {
        id: "business-ai-experience",
        label: "Conversational analytics and executive insight",
        type: "output",
        detail:
          "Deliver governed natural-language analytics, dashboards, anomaly discovery, and executive-ready outputs from trusted data products.",
        x: 1040,
        y: 80,
        ociService: "Oracle Analytics / AI Services",
        layer: "Experience",
        rationale:
          "The business value is realized when users can ask questions and inspect insights without bypassing trusted data and controls.",
        status: "Generated",
        tone: "violet",
      },
      {
        id: "competitor-challenge-lane",
        label: competitorLabel,
        type: "platform",
        detail:
          "Use the competitor path as a measured comparison lane with explicit criteria for cost, governance, data duplication, and production readiness.",
        x: 340,
        y: 330,
        ociService: useCase.input.competitor,
        layer: "Competitive validation",
        rationale:
          "The generated battle card calls for acknowledging competitor strengths while testing production tradeoffs and risks.",
        status: "Review",
        tone: "slate",
      },
    ],
    edges: [
      {
        id: "edge-records-integration",
        source: "oracle-systems-of-record",
        target: "governed-integration",
        label: "fresh governed data",
      },
      {
        id: "edge-integration-core",
        source: "governed-integration",
        target: "oracle-modernization-core",
        label: "trusted data products",
      },
      {
        id: "edge-core-experience",
        source: "oracle-modernization-core",
        target: "business-ai-experience",
        label: "semantic and AI access",
      },
      {
        id: "edge-governance-core",
        source: "governance-control-plane",
        target: "oracle-modernization-core",
        label: "controls",
      },
      {
        id: "edge-competitor-integration",
        source: "competitor-challenge-lane",
        target: "governed-integration",
        label: "compare tradeoffs",
      },
    ],
    metrics: [
      {
        label: "Confidence",
        value: `${useCase.input.discoveryConfidence === "Sparse" ? 68 : 82}%`,
        detail: `${useCase.input.discoveryConfidence} discovery`,
        tone: useCase.input.discoveryConfidence === "Sparse" ? "amber" : "emerald",
      },
      {
        label: "Controls",
        value: "High",
        detail: "Governance visible in draft",
        tone: "blue",
      },
      {
        label: "Compete",
        value: useCase.input.competitor,
        detail: "Challenge lane included",
        tone: "slate",
      },
    ],
    assumptions: [
      "Oracle operational systems remain authoritative until discovery proves otherwise.",
      "Competitor strengths should be tested through workload-specific criteria rather than dismissed.",
      "RAG citations and customer-specific documents should be added before final customer delivery.",
    ],
  }

  return {
    blueprint,
    recommendation: architectureRecommendation,
  }
}

function createRecommendationFromAssist(
  useCase: UseCaseCatalogItem
): ArchitectureRecommendation {
  return {
    verdict: useCase.brief.battleCardOutput.headline,
    summary: useCase.brief.battleCardOutput.oraclePosition,
    recommendedArchitecture: useCase.brief.feeds.architectureGenerator,
    whyOracle: useCase.brief.oracleOpportunities,
    risksToResolve: useCase.brief.competitorRisks,
    nextSteps: useCase.brief.recommendedTalkTrack,
  }
}

function inferSourceLabel(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase()

  if (normalizedPrompt.includes("exadata")) {
    return "Oracle Exadata systems of record"
  }

  if (normalizedPrompt.includes("oracle 19c")) {
    return "Oracle 19c systems of record"
  }

  return "Oracle operational systems of record"
}
