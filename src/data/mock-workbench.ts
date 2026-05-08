import type {
  ArchitectureEdge,
  ArchitectureNode,
  CompetitiveAssistBrief,
  DebateAgent,
  ExecutiveMetric,
  Scenario,
  ScoreboardItem,
  StrategyDomainSummary,
  WhiteboardSignal,
} from "@/types/workbench"

export const executiveMetrics = [
  {
    label: "Active pursuits",
    value: "24",
    change: "+6 this quarter",
    tone: "blue",
  },
  {
    label: "Competitive assists",
    value: "18",
    change: "9 with incomplete discovery",
    tone: "red",
  },
  {
    label: "Architecture drafts",
    value: "31",
    change: "12 ready for review",
    tone: "emerald",
  },
  {
    label: "Sovereign programs",
    value: "7",
    change: "4 require residency mapping",
    tone: "amber",
  },
] satisfies ExecutiveMetric[]

export const strategyDomains = [
  {
    id: "database-modernization",
    title: "Oracle Database Modernization",
    description: "Exadata, Autonomous Database, RAC, Data Guard, and migration strategy.",
    activeScenarios: 8,
    executivePriority: 91,
    signal: "High urgency across core systems",
    tone: "red",
  },
  {
    id: "ai-ml-platform",
    title: "AI/ML Platform Strategy",
    description: "OCI AI Services, vector search, model governance, and GPU capacity planning.",
    activeScenarios: 6,
    executivePriority: 84,
    signal: "GenAI operating model pressure",
    tone: "violet",
  },
  {
    id: "lakehouse-modernization",
    title: "Data Platform / Lakehouse",
    description: "Data Lakehouse, MySQL HeatWave, GoldenGate, analytics, and open data formats.",
    activeScenarios: 7,
    executivePriority: 88,
    signal: "Databricks and Snowflake evaluations",
    tone: "blue",
  },
  {
    id: "sovereign-deployment",
    title: "Government / Sovereign Deployment",
    description: "OCI Dedicated Region, Alloy, air-gapped patterns, residency, and compliance.",
    activeScenarios: 3,
    executivePriority: 94,
    signal: "Residency and accreditation constraints",
    tone: "emerald",
  },
] satisfies StrategyDomainSummary[]

export const scenarios = [
  {
    id: "scn-lakehouse-001",
    title: "Databricks Lakehouse Evaluation",
    account: "Regional Banking Group",
    domain: "lakehouse-modernization",
    stage: "Discovery",
    competitor: "Databricks",
    customerSignal: "Customer is evaluating Databricks for a lakehouse.",
    priorityScore: 87,
    risk: "Elevated",
    drivers: ["open analytics", "model operations", "cost governance"],
    nextAction: "Use Competitive SE Assist to sharpen discovery before architecture debate.",
  },
  {
    id: "scn-db-014",
    title: "Core Banking Database Modernization",
    account: "National Credit Union",
    domain: "database-modernization",
    stage: "Architecture",
    competitor: "AWS Aurora",
    customerSignal: "Board wants measurable risk reduction without a rewrite.",
    priorityScore: 92,
    risk: "Medium",
    drivers: ["availability", "license optimization", "migration sequencing"],
    nextAction: "Generate executive migration narrative with HA tradeoffs.",
  },
  {
    id: "scn-ai-009",
    title: "Sovereign GenAI Operations",
    account: "Public Sector Innovation Lab",
    domain: "ai-ml-platform",
    stage: "Positioning",
    competitor: "Azure AI",
    customerSignal: "AI workloads require auditability and local data processing.",
    priorityScore: 89,
    risk: "Elevated",
    drivers: ["model governance", "GPU availability", "data residency"],
    nextAction: "Run Debate Arena with security, AI platform, and procurement agents.",
  },
  {
    id: "scn-gov-004",
    title: "Sovereign Cloud Landing Zone",
    account: "State Digital Services",
    domain: "sovereign-deployment",
    stage: "Executive Review",
    competitor: "Hyperscaler Region",
    customerSignal: "Procurement requires deployment autonomy and local operations.",
    priorityScore: 95,
    risk: "Critical",
    drivers: ["operational sovereignty", "regulated workloads", "edge connectivity"],
    nextAction: "Finalize deployment model and compliance scorecard.",
  },
] satisfies Scenario[]

export const architectureScoreboard = [
  {
    label: "Strategic fit",
    score: 91,
    target: 85,
    insight: "Strong alignment to modernization and data residency priorities.",
    tone: "emerald",
  },
  {
    label: "Competitive clarity",
    score: 78,
    target: 82,
    insight: "Discovery gaps remain around existing Databricks adoption depth.",
    tone: "amber",
  },
  {
    label: "Architecture readiness",
    score: 84,
    target: 80,
    insight: "Blueprint can proceed once workload classification is confirmed.",
    tone: "blue",
  },
] satisfies ScoreboardItem[]

export const competitiveAssistBrief = {
  prompt: "Customer is evaluating Databricks for a lakehouse.",
  competitor: "Databricks",
  domain: "lakehouse-modernization",
  discoveryConfidence: "Sparse",
  customerSignals: [
    "Lakehouse evaluation",
    "Incomplete discovery",
    "Oracle data gravity likely",
    "Governance and cost unknown",
  ],
  inferredPriorities: [
    "Unified analytics and AI across structured and semi-structured data.",
    "Faster experimentation for data science and engineering teams.",
    "Cost control as lakehouse workloads move from pilot to production.",
    "Governance across data, models, notebooks, and pipelines.",
  ],
  discoveryQuestions: [
    "Which workloads are driving the evaluation: BI, ML, streaming, regulatory reporting, or consolidation?",
    "What data already lives in Oracle systems, and what latency is required between systems of record and analytics?",
    "Who owns platform operations today: central IT, data engineering, analytics, or business units?",
    "What compliance, residency, audit, or sovereign deployment constraints apply?",
  ],
  oracleOpportunities: [
    "Position Oracle as the lower-friction path when critical data already sits in Oracle Database estates.",
    "Connect Autonomous Database, GoldenGate, OCI Data Lake, and AI Services into a governed modernization path.",
    "Show how HeatWave, Oracle Analytics, and OCI Data Science can reduce platform sprawl for production workloads.",
    "Use Dedicated Region, Alloy, and sovereign controls when deployment autonomy matters.",
  ],
  competitorStrengths: [
    "Databricks has strong mindshare with data engineers and data science teams.",
    "Lakehouse messaging is simple and familiar to customers consolidating analytics stacks.",
    "Notebook-first workflows can accelerate experimentation and collaboration.",
  ],
  competitorRisks: [
    "Production governance, residency, and operational controls may need additional services.",
    "Cost predictability can become difficult as concurrency and model workloads scale.",
    "Oracle system-of-record integration may introduce latency, movement, and control tradeoffs.",
  ],
  battleCardGuidance: [
    "Lead with workload economics, governed production operations, and data gravity.",
    "Avoid dismissing Databricks; acknowledge its data science strength and redirect to enterprise operating model.",
    "Ask for one representative workload and produce a side-by-side architecture debate.",
  ],
  recommendedTalkTrack: [
    "Acknowledge the appeal of Databricks for data engineering and experimentation.",
    "Shift the conversation to production controls: Oracle data gravity, governance, cost predictability, and operational ownership.",
    "Ask for one representative workload so Oracle can compare data movement, latency, security, and run-cost assumptions.",
  ],
  battleCardOutput: {
    headline: "Do not fight the notebook story; reframe around governed production lakehouse operations.",
    customerConcern:
      "The customer likely wants faster analytics and AI experimentation but has not yet exposed production governance, cost, or Oracle data integration requirements.",
    oraclePosition:
      "Oracle can modernize the lakehouse path around systems of record, GoldenGate, Autonomous Database, OCI Data Lake, and OCI AI Services.",
    landmine:
      "Do not dismiss Databricks. Validate its strengths, then make the customer quantify production operating model assumptions.",
    nextMove:
      "Feed this brief into Debate Arena with data engineering, security, economics, and Oracle modernization agents.",
  },
  feeds: {
    debateArena:
      "Seed agents for data engineering, AI governance, cloud economics, security, and Oracle modernization.",
    architectureGenerator:
      "Generate a lakehouse modernization blueprint with Oracle data gravity, governance, and AI service integration.",
  },
} satisfies CompetitiveAssistBrief

export const debateAgents = [
  {
    id: "agent-modernization",
    name: "Modernization Strategist",
    role: "Oracle estate and migration path",
    stance: "Prioritize modernization paths that reduce data movement and operational risk.",
    score: 92,
    tone: "red",
  },
  {
    id: "agent-ai",
    name: "AI Platform Lead",
    role: "Model, notebook, and MLOps strategy",
    stance: "Validate ML lifecycle expectations before choosing a lakehouse control plane.",
    score: 86,
    tone: "violet",
  },
  {
    id: "agent-economics",
    name: "Cloud Economist",
    role: "Cost, scale, and platform sprawl",
    stance: "Expose concurrency, data movement, and egress assumptions early.",
    score: 81,
    tone: "amber",
  },
  {
    id: "agent-sovereign",
    name: "Sovereignty Advisor",
    role: "Residency and regulated deployment",
    stance: "Keep residency, audit, and operator control in the first architecture draft.",
    score: 94,
    tone: "emerald",
  },
] satisfies DebateAgent[]

export const architectureNodes = [
  {
    id: "oracle-data",
    label: "Oracle Systems of Record",
    type: "input",
    detail: "Database estate, ERP, and regulated operational data.",
    x: 0,
    y: 120,
  },
  {
    id: "goldengate",
    label: "GoldenGate / Data Integration",
    type: "service",
    detail: "Low-latency replication and movement controls.",
    x: 260,
    y: 120,
  },
  {
    id: "lakehouse",
    label: "OCI Data Lakehouse",
    type: "platform",
    detail: "Open analytics layer with governed object storage.",
    x: 520,
    y: 40,
  },
  {
    id: "autonomous",
    label: "Autonomous Database",
    type: "platform",
    detail: "Curated serving, SQL analytics, and operational reporting.",
    x: 520,
    y: 210,
  },
  {
    id: "ai-services",
    label: "OCI AI Services",
    type: "service",
    detail: "Model experimentation, inference, and vector workflows.",
    x: 780,
    y: 40,
  },
  {
    id: "governance",
    label: "Governance and Sovereignty",
    type: "governance",
    detail: "Residency, audit, access policy, and model controls.",
    x: 780,
    y: 210,
  },
  {
    id: "outcomes",
    label: "Executive Outcomes",
    type: "output",
    detail: "Modernization roadmap, risk scorecard, and business case.",
    x: 1040,
    y: 120,
  },
] satisfies ArchitectureNode[]

export const architectureEdges = [
  {
    id: "edge-oracle-goldengate",
    source: "oracle-data",
    target: "goldengate",
    label: "replicate",
  },
  {
    id: "edge-goldengate-lakehouse",
    source: "goldengate",
    target: "lakehouse",
    label: "stream",
  },
  {
    id: "edge-goldengate-autonomous",
    source: "goldengate",
    target: "autonomous",
    label: "serve",
  },
  {
    id: "edge-lakehouse-ai",
    source: "lakehouse",
    target: "ai-services",
    label: "train",
  },
  {
    id: "edge-autonomous-governance",
    source: "autonomous",
    target: "governance",
    label: "control",
  },
  {
    id: "edge-ai-outcomes",
    source: "ai-services",
    target: "outcomes",
    label: "recommend",
  },
  {
    id: "edge-governance-outcomes",
    source: "governance",
    target: "outcomes",
    label: "assure",
  },
] satisfies ArchitectureEdge[]

export const whiteboardSignals = [
  {
    title: "Sketch capture",
    status: "Ready",
    detail: "Capture customer-drawn flows and convert them into structured architecture notes.",
    tone: "blue",
  },
  {
    title: "Architecture extraction",
    status: "Queued",
    detail: "Detect Oracle systems, external platforms, data movement, controls, and open risks.",
    tone: "amber",
  },
  {
    title: "Generator handoff",
    status: "Connected",
    detail: "Send extracted components into the Architecture Generator workstream.",
    tone: "emerald",
  },
] satisfies WhiteboardSignal[]
