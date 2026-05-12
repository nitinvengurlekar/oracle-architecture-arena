import type {
  ArchitectureDebate,
  ArchitectureGeneratorBlueprint,
  UseCaseCatalogItem,
} from "@/types/workbench"

export const smokeTestUseCaseId = "smoke-aws-databricks-transportation-v1"

export const smokeTestUseCase: UseCaseCatalogItem = {
  id: smokeTestUseCaseId,
  title: "Smoke Test: AWS + Databricks Transportation Authority",
  createdAt: "2026-05-11T14:00:00.000Z",
  updatedAt: "2026-05-11T14:00:00.000Z",
  input: {
    prompt:
      "A national transportation and tolling authority is modernizing analytics on AWS S3 and Databricks while Tableau and Looker serve different business teams. Oracle 19c on Exadata remains the system of record for toll billing, payments, permitting, asset management, procurement, and financial systems. The CIO wants guidance on standardizing around AWS plus Databricks versus using Oracle to preserve trusted operational records, governed AI search, conversational analytics, security, lineage, and public-sector controls.",
    competitor: "Databricks",
    domain: "lakehouse-modernization",
    discoveryConfidence: "Directional",
  },
  brief: {
    prompt:
      "A national transportation and tolling authority is modernizing analytics on AWS S3 and Databricks while Tableau and Looker serve different business teams. Oracle 19c on Exadata remains the system of record for toll billing, payments, permitting, asset management, procurement, and financial systems. The CIO wants guidance on standardizing around AWS plus Databricks versus using Oracle to preserve trusted operational records, governed AI search, conversational analytics, security, lineage, and public-sector controls.",
    competitor: "Databricks",
    domain: "lakehouse-modernization",
    discoveryConfidence: "Directional",
    customerSignals: [
      "AWS S3 data lake and Databricks on AWS pilot are already in motion.",
      "Tableau and Looker are both active analytics consumption paths.",
      "Oracle 19c on Exadata remains authoritative for mission-critical records.",
      "Public-sector audit, retention, lineage, and security controls matter.",
    ],
    inferredPriorities: [
      "Reduce duplicated data movement while still enabling lakehouse analytics.",
      "Preserve trusted Oracle systems of record for payment and permitting integrity.",
      "Give business users conversational analytics without fragmenting governance.",
      "Compare Databricks experimentation velocity against Oracle production controls.",
    ],
    discoveryQuestions: [
      "Which analytics workloads must be near-real-time from tolling, payments, permitting, and finance systems?",
      "Which Tableau and Looker dashboards are executive-critical, and which can be rationalized?",
      "What data must remain under Oracle audit, retention, encryption, and lineage controls?",
      "Is Databricks intended as a production standard or a data engineering and ML pilot platform?",
      "What AWS commitments, skills, and operating responsibilities already exist?",
    ],
    oracleOpportunities: [
      "Position Oracle as the trusted production backbone for Exadata-backed systems of record while enabling governed lakehouse access.",
      "Use GoldenGate and OCI data services to make movement, freshness, and lineage explicit instead of duplicating everything into AWS.",
      "Show how Autonomous Database, Oracle Analytics, OCI AI Services, and vector search can support conversational analytics over governed operational data.",
      "Frame Databricks as a credible experimentation lane that still needs production controls, cost modeling, and source-system integrity.",
    ],
    competitorStrengths: [
      "Databricks on AWS is strong for Spark-based engineering, notebooks, ML experimentation, and lakehouse messaging.",
      "AWS S3 is already familiar as an open data lake landing zone.",
      "Tableau and Looker give business teams familiar analytics entry points.",
    ],
    competitorRisks: [
      "Moving authoritative Oracle data into AWS can create duplication, lineage, freshness, and payment-integrity risks.",
      "Tableau plus Looker plus Databricks can increase semantic layer fragmentation.",
      "Public-sector audit, retention, and operator controls may require extra services and architecture discipline.",
    ],
    recommendedTalkTrack: [
      "Acknowledge that AWS and Databricks can accelerate data engineering and ML pilots.",
      "Shift the decision from lakehouse branding to trusted production operations around Oracle systems of record.",
      "Ask the agency to select one tolling or finance workload and compare freshness, controls, cost, and semantic consistency side by side.",
      "Position Oracle as the lower-risk modernization path for governed analytics and AI over data that must remain authoritative.",
    ],
    battleCardGuidance: [
      "Do not dismiss Databricks; treat it as a credible data engineering and ML workbench.",
      "Press on production controls: lineage, semantic consistency, Oracle source-system freshness, and audit evidence.",
      "Use Tableau and Looker as discovery anchors for business consumption and semantic layer complexity.",
      "Feed the case into Debate Arena before drafting a final architecture.",
    ],
    battleCardOutput: {
      headline:
        "Keep Databricks honest on production governance while Oracle anchors trusted transportation records.",
      customerConcern:
        "The agency wants AWS and Databricks velocity, but it cannot compromise payment integrity, permitting records, audit controls, or business-facing analytics consistency.",
      oraclePosition:
        "Oracle should position a governed modernization path around Exadata systems of record, GoldenGate, Autonomous Database, OCI AI Services, and controlled analytics access for Tableau and Looker.",
      landmine:
        "Do not fight the AWS or Databricks pilot emotionally. Ask which production controls, records, and semantic definitions must survive the pilot.",
      nextMove:
        "Run Debate Arena using Databricks as the competitor, then generate a blueprint that includes Oracle records, AWS/Databricks challenge areas, Tableau, Looker, and public-sector controls.",
    },
    feeds: {
      debateArena:
        "Test Oracle production governance against AWS plus Databricks experimentation velocity, Tableau/Looker semantic fragmentation, and public-sector controls.",
      architectureGenerator:
        "Generate a governed architecture that keeps Oracle Exadata systems authoritative, exposes controlled data products, supports conversational analytics, and documents AWS/Databricks integration risks.",
    },
  },
  generation: {
    mode: "llm",
    model: "Recorded smoke test v1",
  },
  ragContext: [
    {
      id: "rag-oracle-data-gravity",
      title: "Oracle systems of record and data gravity",
      sourceType: "oracle-capability",
      excerpt:
        "Oracle modernization should account for workload behavior, data gravity, performance, licensing posture, and operational ownership before moving trusted records into another platform.",
      score: 91,
    },
    {
      id: "rag-governed-lakehouse",
      title: "Governed lakehouse modernization",
      sourceType: "architecture-pattern",
      excerpt:
        "A governed lakehouse path should make freshness, lineage, semantic ownership, cost, and production controls explicit across data engineering, analytics, and AI workloads.",
      score: 88,
    },
    {
      id: "rag-public-sector-controls",
      title: "Public-sector control requirements",
      sourceType: "governance-pattern",
      excerpt:
        "Government modernization should preserve audit evidence, retention rules, encryption policy, operator controls, and data residency assumptions in the first architecture draft.",
      score: 86,
    },
    {
      id: "rag-databricks-strengths",
      title: "Databricks competitive context",
      sourceType: "competitive-context",
      excerpt:
        "Databricks is credible for notebook collaboration, Spark engineering, and ML experimentation, but production architecture must validate governance, serving consistency, and cost predictability.",
      score: 83,
    },
  ],
}

export const seededUseCaseCatalogItems = [smokeTestUseCase]

export const smokeTestArchitectureDebate = {
  scenario: "AWS + Databricks Transportation Authority",
  customerContext: smokeTestUseCase.input.prompt,
  agents: {
    oracle: {
      id: "smoke-oracle-architect",
      role: "oracle",
      name: "Oracle Architect Agent",
      title: "Government Data Platform Modernization Architect",
      organization: "Oracle strategy team",
      objective:
        "Propose a governed Oracle-led modernization path that preserves Exadata systems of record while enabling AI search, conversational analytics, and controlled lakehouse access.",
      response:
        "Oracle should anchor the production architecture on the agency's Exadata systems of record, then expose governed data products through GoldenGate, Autonomous Database, OCI Data Lake, OCI AI Services, and a consistent semantic layer for Tableau and Looker. AWS and Databricks can remain valid challenge lanes for data engineering and ML experimentation, but the production design must prove payment integrity, lineage, retention, and cost controls before standardization.",
      keyClaims: [
        "Oracle systems of record are the trusted production anchor for tolling, payments, permitting, procurement, and finance.",
        "GoldenGate and Autonomous Database reduce the risk of uncontrolled replication into AWS.",
        "OCI AI Services and vector workflows can support conversational analytics over governed data products.",
        "Tableau and Looker should be treated as consumption channels, not competing sources of truth.",
      ],
      watchItems: [
        "Validate which dashboards and AI questions require near-real-time Oracle data.",
        "Quantify AWS data movement, egress, and Databricks concurrency costs.",
        "Confirm public-sector audit, retention, and operator-control requirements.",
      ],
      confidence: 91,
      tone: "red",
    },
    competitor: {
      id: "smoke-databricks-architect",
      role: "competitor",
      name: "Databricks Architect Agent",
      title: "AWS Lakehouse Strategy Advocate",
      organization: "Competitive perspective",
      objective:
        "Represent why AWS plus Databricks may be attractive for data engineering, ML experimentation, and lakehouse standardization.",
      response:
        "Databricks on AWS gives the data engineering team a familiar lakehouse control plane over S3, strong Spark execution, collaborative notebooks, and a direct path into ML experimentation for congestion forecasting and anomaly detection. Tableau and Looker can continue to consume curated products while teams modernize incrementally. If speed, open data formats, and ML workflow familiarity dominate the decision, AWS plus Databricks is a strong candidate.",
      keyClaims: [
        "AWS S3 and Databricks are already part of the agency's pilot path.",
        "Streaming toll data, telemetry, and road maintenance logs fit Databricks engineering strengths.",
        "Data science teams may move faster with notebooks and familiar Spark workflows.",
      ],
      watchItems: [
        "Authoritative Oracle data still needs governed movement and freshness controls.",
        "Tableau and Looker can fragment metrics without a controlled semantic strategy.",
        "Public-sector audit and retention needs may add operational complexity.",
      ],
      confidence: 84,
      tone: "blue",
    },
    judge: {
      id: "smoke-neutral-cto-judge",
      role: "judge",
      name: "Neutral CTO Judge",
      title: "Public Sector Architecture Arbiter",
      organization: "Independent executive review",
      objective:
        "Score the Oracle and AWS/Databricks paths against production readiness, governance, analytics usability, and modernization risk.",
      response:
        "Both paths are credible, but they solve different parts of the problem. AWS plus Databricks is attractive for engineering velocity and ML experimentation. Oracle is stronger as the governed production backbone because the records of authority remain on Exadata and the agency cannot compromise payment integrity, audit evidence, or semantic consistency. The recommendation is to keep Oracle as the production anchor and run a workload-specific Databricks challenge on streaming and ML workloads.",
      keyClaims: [
        "The decision should separate experimentation velocity from production authority.",
        "Oracle has the stronger default position where Exadata records, audit controls, and lineage dominate.",
        "Databricks should be tested on toll streaming, telemetry, and ML use cases with explicit cost and governance criteria.",
      ],
      watchItems: [
        "Do not allow Tableau and Looker to create conflicting metric definitions.",
        "Require a side-by-side freshness and data movement model.",
        "Keep public-sector retention and audit controls in the architecture scorecard.",
      ],
      confidence: 89,
      tone: "emerald",
    },
  },
  scores: [
    {
      criterion: "Systems-of-record protection",
      oracleScore: 94,
      competitorScore: 76,
      judgeWeight: 24,
      rationale:
        "Oracle has the stronger fit where Exadata-backed payment, permitting, and finance records remain authoritative.",
    },
    {
      criterion: "Engineering and ML velocity",
      oracleScore: 80,
      competitorScore: 91,
      judgeWeight: 18,
      rationale:
        "Databricks on AWS remains highly credible for Spark engineering, notebooks, streaming, and ML experimentation.",
    },
    {
      criterion: "Governance and public-sector controls",
      oracleScore: 92,
      competitorScore: 78,
      judgeWeight: 22,
      rationale:
        "Audit, retention, lineage, and operator-control requirements favor an Oracle-anchored production architecture.",
    },
    {
      criterion: "BI and semantic consistency",
      oracleScore: 87,
      competitorScore: 80,
      judgeWeight: 18,
      rationale:
        "Tableau and Looker can both work, but the architecture needs a governed semantic layer tied to trusted data products.",
    },
    {
      criterion: "Cost and operating model clarity",
      oracleScore: 85,
      competitorScore: 77,
      judgeWeight: 18,
      rationale:
        "The AWS/Databricks path needs stronger evidence around data movement, concurrency, egress, and production ownership.",
    },
  ],
  recommendation: {
    verdict:
      "Oracle production anchor with AWS/Databricks challenge lane for engineering and ML",
    summary:
      "Use Oracle as the governed production backbone because the agency's authoritative records remain on Exadata and public-sector controls matter. Keep AWS plus Databricks in the evaluation as a targeted challenge lane for streaming, telemetry, and ML experimentation.",
    recommendedArchitecture:
      "Oracle Exadata systems of record feed governed data products through GoldenGate, Autonomous Database, OCI Data Lake, and OCI AI Services. Tableau and Looker consume trusted semantic outputs, while AWS S3 and Databricks are tested against explicit freshness, lineage, cost, and governance criteria.",
    whyOracle: [
      "Oracle starts from the agency's authoritative Exadata records instead of forcing a new source of truth.",
      "GoldenGate and Autonomous Database can reduce movement and freshness risk for operational analytics.",
      "OCI AI Services and vector workflows can support conversational analytics with stronger governance.",
      "Oracle can make public-sector audit, retention, and operator controls first-class architecture requirements.",
    ],
    risksToResolve: [
      "Existing AWS commitments, Databricks skills, and platform ownership need discovery.",
      "Tableau and Looker semantic ownership must be rationalized.",
      "Streaming freshness, egress, concurrency, and ML serving economics need a side-by-side model.",
    ],
    nextSteps: [
      "Choose one representative tolling or procurement analytics workload.",
      "Model Oracle-to-AWS data movement against GoldenGate and OCI serving alternatives.",
      "Define the semantic owner for Tableau, Looker, and conversational analytics.",
      "Generate an architecture blueprint with Oracle production controls and AWS/Databricks challenge points.",
    ],
  },
} satisfies ArchitectureDebate

export const smokeTestArchitectureBlueprint = {
  id: "blueprint-smoke-aws-databricks-transportation-v1",
  title: "Transportation Authority Governed Analytics Blueprint",
  generatedFrom: "Smoke Test: AWS + Databricks Transportation Authority",
  recommendationSource:
    "Oracle production anchor with AWS/Databricks challenge lane",
  confidence: 88,
  summary:
    "Persistent smoke-test blueprint that keeps Oracle Exadata systems authoritative, compares AWS S3 and Databricks as the lakehouse challenge lane, rationalizes Tableau and Looker consumption, and makes public-sector governance visible in the architecture.",
  nodes: [
    {
      id: "exadata-records",
      label: "Transportation Systems of Record",
      type: "input",
      detail:
        "Oracle 19c on Exadata for toll billing, payments, permitting, procurement, asset management, and finance.",
      ociService: "Oracle Exadata",
      layer: "Authoritative records",
      rationale:
        "The smoke test starts from mission-critical Oracle records that must remain trusted for payment integrity and audit controls.",
      status: "Validated",
      tone: "red",
      x: 0,
      y: 155,
    },
    {
      id: "goldengate-products",
      label: "Controlled Data Product Feed",
      type: "service",
      detail:
        "Fresh, governed replication and transformation path for analytics and AI consumers.",
      ociService: "Oracle GoldenGate",
      layer: "Integration and lineage",
      rationale:
        "Makes freshness, movement, lineage, and duplication explicit before data is copied into AWS or Databricks.",
      status: "Generated",
      tone: "amber",
      x: 280,
      y: 155,
    },
    {
      id: "aws-databricks-lane",
      label: "AWS + Databricks Challenge Lane",
      type: "platform",
      detail:
        "AWS S3 and Databricks pilot for streaming toll data, telemetry, maintenance logs, and congestion forecasting.",
      ociService: "AWS S3 / Databricks",
      layer: "Competitive lakehouse lane",
      rationale:
        "Keeps the competitor evaluation visible so the architecture can test velocity against production governance.",
      status: "Review",
      tone: "blue",
      x: 575,
      y: 35,
    },
    {
      id: "oracle-serving",
      label: "Trusted Serving and Semantic Layer",
      type: "platform",
      detail:
        "Curated reporting marts, operational analytics, metric definitions, and governed SQL serving.",
      ociService: "Autonomous Database",
      layer: "Trusted analytics serving",
      rationale:
        "Prevents Tableau, Looker, and conversational analytics from drifting away from trusted Oracle-backed definitions.",
      status: "Generated",
      tone: "red",
      x: 575,
      y: 275,
    },
    {
      id: "conversational-ai",
      label: "Conversational Analytics and AI Search",
      type: "service",
      detail:
        "Natural language analytics, anomaly prompts, document search, embeddings, and model workflow controls.",
      ociService: "OCI AI Services",
      layer: "AI and search",
      rationale:
        "Supports questions such as budget variance trends and procurement anomalies without bypassing governance.",
      status: "Review",
      tone: "violet",
      x: 875,
      y: 35,
    },
    {
      id: "bi-consumption",
      label: "Tableau and Looker Consumers",
      type: "output",
      detail:
        "Executive dashboards, self-service analytics, journey reporting, and governed data product consumption.",
      ociService: "Tableau / Looker",
      layer: "Business consumption",
      rationale:
        "The smoke test explicitly checks whether both BI tools can consume consistent trusted outputs.",
      status: "Generated",
      tone: "slate",
      x: 875,
      y: 275,
    },
    {
      id: "public-sector-controls",
      label: "Public-Sector Governance Controls",
      type: "governance",
      detail:
        "Audit evidence, retention, data residency, encryption policy, operator controls, and lineage.",
      ociService: "OCI Governance",
      layer: "Controls",
      rationale:
        "The architecture must prove security, lineage, and regulatory controls before any platform standardization.",
      status: "Validated",
      tone: "emerald",
      x: 1180,
      y: 155,
    },
    {
      id: "decision-package",
      label: "Executive Decision Package",
      type: "output",
      detail:
        "Side-by-side workload scorecard, risk register, cost model, and next discovery actions.",
      ociService: "Architecture Center",
      layer: "Decision outputs",
      rationale:
        "Turns the smoke-test debate into a reusable executive artifact for the next architecture review.",
      status: "Generated",
      tone: "slate",
      x: 1485,
      y: 155,
    },
  ],
  edges: [
    {
      id: "edge-records-goldengate",
      source: "exadata-records",
      target: "goldengate-products",
      label: "govern",
    },
    {
      id: "edge-goldengate-databricks",
      source: "goldengate-products",
      target: "aws-databricks-lane",
      label: "challenge",
    },
    {
      id: "edge-goldengate-serving",
      source: "goldengate-products",
      target: "oracle-serving",
      label: "serve",
    },
    {
      id: "edge-databricks-ai",
      source: "aws-databricks-lane",
      target: "conversational-ai",
      label: "compare",
    },
    {
      id: "edge-serving-ai",
      source: "oracle-serving",
      target: "conversational-ai",
      label: "ground",
    },
    {
      id: "edge-serving-bi",
      source: "oracle-serving",
      target: "bi-consumption",
      label: "publish",
    },
    {
      id: "edge-ai-controls",
      source: "conversational-ai",
      target: "public-sector-controls",
      label: "audit",
    },
    {
      id: "edge-bi-controls",
      source: "bi-consumption",
      target: "public-sector-controls",
      label: "lineage",
    },
    {
      id: "edge-controls-decision",
      source: "public-sector-controls",
      target: "decision-package",
      label: "decide",
    },
  ],
  metrics: [
    {
      label: "Architecture readiness",
      value: "88%",
      detail: "Ready for a workload-specific pilot comparison.",
      tone: "emerald",
    },
    {
      label: "Governance coverage",
      value: "7/8",
      detail: "Controls are visible across records, AI, BI, and lakehouse lanes.",
      tone: "blue",
    },
    {
      label: "Open decisions",
      value: "4",
      detail: "AWS commitments, Databricks spend, BI semantic owner, and freshness SLAs.",
      tone: "amber",
    },
  ],
  assumptions: [
    "Oracle 19c on Exadata remains authoritative for tolling, payments, permitting, procurement, and finance.",
    "AWS S3 and Databricks are active evaluation lanes, not automatically the production standard.",
    "Tableau and Looker both need governed semantic outputs.",
    "Public-sector audit, retention, lineage, and operator controls are decision criteria.",
  ],
} satisfies ArchitectureGeneratorBlueprint
