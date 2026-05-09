import type {
  ArchitectureEdge,
  ArchitectureDebate,
  ArchitectureNode,
  ArchitectureGeneratorBlueprint,
  CompetitiveAssistBrief,
  DebateAgent,
  ExecutiveMetric,
  Scenario,
  ScoreboardItem,
  StrategyDomainSummary,
  WhiteboardAiHook,
  WhiteboardNote,
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

export const architectureDebate = {
  scenario: "Databricks Lakehouse Evaluation",
  customerContext:
    "Regional banking customer is evaluating Databricks for a lakehouse while core systems of record remain on Oracle Database. Discovery is incomplete, but governance, cost predictability, model operations, and data movement are likely decision factors.",
  agents: {
    oracle: {
      id: "oracle-architect",
      role: "oracle",
      name: "Oracle Architect Agent",
      title: "Modernization and Data Platform Architect",
      organization: "Oracle strategy team",
      objective:
        "Propose an Oracle-led architecture that keeps trusted enterprise data governed while enabling lakehouse analytics and AI.",
      response:
        "Start from the customer's Oracle data gravity. Use GoldenGate for controlled movement, OCI Data Lake for open data zones, Autonomous Database for curated serving, and OCI AI Services for model workflows. The architecture should reduce duplication, preserve governance, and make cost controls explicit before the customer commits to a separate lakehouse control plane.",
      keyClaims: [
        "Oracle systems of record should anchor the first architecture draft.",
        "GoldenGate and Autonomous Database reduce integration risk for production analytics.",
        "OCI governance and sovereign deployment options keep regulated workloads in scope.",
      ],
      watchItems: [
        "Confirm actual Databricks adoption depth before positioning too aggressively.",
        "Validate latency requirements between operational systems and analytics users.",
        "Quantify concurrency, data movement, and model serving economics.",
      ],
      confidence: 91,
      tone: "red",
    },
    competitor: {
      id: "competitor-architect",
      role: "competitor",
      name: "Competitor Architect Agent",
      title: "Databricks Lakehouse Advocate",
      organization: "Competitive perspective",
      objective:
        "Represent why the customer may prefer Databricks for lakehouse standardization.",
      response:
        "Databricks gives data engineering and data science teams a unified collaborative workspace. A notebook-first experience, strong Spark ecosystem, and simple lakehouse narrative can help the customer move quickly from raw data to ML experimentation. If the customer values developer velocity above Oracle estate integration, Databricks will feel like the natural center of gravity.",
      keyClaims: [
        "Data engineering and data science teams already understand the Databricks workflow.",
        "The lakehouse story is straightforward for analytics consolidation.",
        "Experimentation speed may matter more than platform consolidation in the first phase.",
      ],
      watchItems: [
        "Production governance may require additional controls and adjacent services.",
        "Oracle source-system integration can introduce movement and latency tradeoffs.",
        "Consumption costs may become harder to predict at production concurrency.",
      ],
      confidence: 82,
      tone: "blue",
    },
    judge: {
      id: "neutral-cto-judge",
      role: "judge",
      name: "Neutral CTO Judge",
      title: "Executive Architecture Arbiter",
      organization: "Independent review",
      objective:
        "Score both approaches against enterprise readiness, risk, and decision clarity.",
      response:
        "Both positions are credible. Databricks is compelling for team velocity and experimentation, but the current customer signal is too incomplete to crown it as the production architecture. Oracle has the stronger enterprise path if regulated data, operational integration, sovereignty, and cost predictability matter. The recommended path is a workload-specific bakeoff with Oracle's governed architecture as the default production baseline.",
      keyClaims: [
        "The decision should be workload-specific, not platform-brand-led.",
        "Oracle has stronger leverage where systems of record, governance, and residency dominate.",
        "Databricks strength should be acknowledged and tested against production controls.",
      ],
      watchItems: [
        "Do not overfit the recommendation before discovery confirms buyer priorities.",
        "Resolve ownership of platform operations and governance.",
        "Require a side-by-side cost and data movement model.",
      ],
      confidence: 88,
      tone: "emerald",
    },
  },
  scores: [
    {
      criterion: "Enterprise governance",
      oracleScore: 92,
      competitorScore: 78,
      judgeWeight: 24,
      rationale:
        "Oracle has stronger native alignment to regulated data, database controls, and sovereign deployment patterns.",
    },
    {
      criterion: "Data science velocity",
      oracleScore: 78,
      competitorScore: 91,
      judgeWeight: 18,
      rationale:
        "Databricks remains highly credible for notebook-first experimentation and data science collaboration.",
    },
    {
      criterion: "Operational integration",
      oracleScore: 90,
      competitorScore: 75,
      judgeWeight: 22,
      rationale:
        "Oracle wins when the architecture depends on low-friction integration with Oracle systems of record.",
    },
    {
      criterion: "Cost predictability",
      oracleScore: 84,
      competitorScore: 76,
      judgeWeight: 16,
      rationale:
        "The judge wants concurrency, data movement, and model serving assumptions quantified before final selection.",
    },
    {
      criterion: "Time to pilot",
      oracleScore: 80,
      competitorScore: 88,
      judgeWeight: 20,
      rationale:
        "Databricks may move faster for an isolated pilot, while Oracle is stronger as the governed production baseline.",
    },
  ],
  recommendation: {
    verdict: "Oracle production baseline with targeted Databricks challenge areas",
    summary:
      "Use Oracle as the recommended production architecture when governance, Oracle data gravity, integration, and cost predictability matter. Treat Databricks as a credible challenger for experimentation velocity and test it through a representative workload.",
    recommendedArchitecture:
      "Oracle Database systems of record connected through GoldenGate into OCI Data Lake and Autonomous Database serving layers, with OCI AI Services and governance controls attached before production rollout.",
    whyOracle: [
      "Stronger fit for regulated Oracle data and production governance.",
      "Lower integration risk for systems of record that already run on Oracle.",
      "Clearer path to sovereign, audit, and operator-control requirements.",
    ],
    risksToResolve: [
      "Confirm whether the customer already has Databricks skills or committed platform spend.",
      "Validate freshness requirements between operational systems and lakehouse consumers.",
      "Model production concurrency, data movement, and AI serving costs.",
    ],
    nextSteps: [
      "Run discovery on workload, data sources, governance, and operating ownership.",
      "Create a side-by-side architecture for one representative lakehouse workload.",
      "Send the winning assumptions into Architecture Generator for a production blueprint.",
    ],
  },
} satisfies ArchitectureDebate

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

export const generatedArchitectureBlueprint = {
  id: "blueprint-lakehouse-001",
  title: "Oracle Governed Lakehouse Blueprint",
  generatedFrom: "Debate Arena: Databricks Lakehouse Evaluation",
  recommendationSource:
    "Oracle production baseline with targeted Databricks challenge areas",
  confidence: 85,
  summary:
    "Generated architecture keeps Oracle systems of record as the trusted anchor, uses GoldenGate to control data movement, and promotes governed lakehouse, database, and AI service layers into a production-ready OCI blueprint.",
  nodes: [
    {
      id: "oracle-data",
      label: "Oracle Systems of Record",
      type: "input",
      detail: "Core database estate, ERP, and regulated operational data.",
      ociService: "Oracle Database",
      layer: "Source systems",
      rationale:
        "The Debate Arena recommendation starts from Oracle data gravity and avoids unnecessary duplication of trusted systems.",
      status: "Validated",
      tone: "red",
      x: 0,
      y: 120,
    },
    {
      id: "goldengate",
      label: "Controlled Data Movement",
      type: "service",
      detail: "Low-latency replication, transformation, and movement policy.",
      ociService: "Oracle GoldenGate",
      layer: "Integration",
      rationale:
        "GoldenGate turns the competitor risk around data movement into an explicit governed integration layer.",
      status: "Generated",
      tone: "amber",
      x: 270,
      y: 120,
    },
    {
      id: "lakehouse",
      label: "Open Lakehouse Zone",
      type: "platform",
      detail: "Object storage, open formats, curated data products, and analytics access.",
      ociService: "OCI Data Lake",
      layer: "Lakehouse",
      rationale:
        "Provides the lakehouse architecture pattern while keeping platform controls aligned to OCI governance.",
      status: "Review",
      tone: "blue",
      x: 550,
      y: 35,
    },
    {
      id: "autonomous",
      label: "Curated Serving Layer",
      type: "platform",
      detail: "SQL analytics, reporting marts, operational dashboards, and workload isolation.",
      ociService: "Autonomous Database",
      layer: "Serving",
      rationale:
        "Keeps high-value production analytics close to Oracle capabilities and predictable operations.",
      status: "Generated",
      tone: "red",
      x: 550,
      y: 230,
    },
    {
      id: "ai-services",
      label: "AI and Model Workflows",
      type: "service",
      detail: "Model experimentation, inference endpoints, embeddings, and vector workflows.",
      ociService: "OCI AI Services",
      layer: "AI/ML",
      rationale:
        "Answers the competitor velocity advantage by creating a clear model workflow lane inside the Oracle blueprint.",
      status: "Review",
      tone: "violet",
      x: 835,
      y: 35,
    },
    {
      id: "governance",
      label: "Governance and Sovereignty",
      type: "governance",
      detail: "Identity, audit, data residency, policy, encryption, and operator control.",
      ociService: "OCI Governance",
      layer: "Controls",
      rationale:
        "Elevates the judge's governance and sovereignty criteria into a cross-cutting architecture control plane.",
      status: "Validated",
      tone: "emerald",
      x: 835,
      y: 230,
    },
    {
      id: "outcomes",
      label: "Executive Decision Outputs",
      type: "output",
      detail: "Modernization roadmap, risk register, cost model, and pilot scorecard.",
      ociService: "Architecture Center",
      layer: "Outcomes",
      rationale:
        "Connects generated architecture choices back to executive decision material and sales engineering next steps.",
      status: "Generated",
      tone: "slate",
      x: 1120,
      y: 120,
    },
  ],
  edges: architectureEdges,
  metrics: [
    {
      label: "Architecture readiness",
      value: "85%",
      detail: "Ready for workload-specific refinement and review.",
      tone: "emerald",
    },
    {
      label: "Governance coverage",
      value: "6/7",
      detail: "Controls are attached to every generated production lane.",
      tone: "blue",
    },
    {
      label: "Open decisions",
      value: "3",
      detail: "Freshness, concurrency, and existing Databricks investment.",
      tone: "amber",
    },
  ],
  assumptions: [
    "Oracle databases remain the trusted source for regulated systems of record.",
    "A representative workload will be used before platform standardization.",
    "Governance, cost predictability, and residency are executive decision criteria.",
  ],
} satisfies ArchitectureGeneratorBlueprint

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

export const whiteboardNotes = [
  {
    id: "note-current-state",
    category: "Context",
    title: "Current state",
    body: "Customer sketch should identify Oracle systems of record, analytics consumers, integration paths, and any external lakehouse platform already in evaluation.",
    tone: "blue",
  },
  {
    id: "note-assumption",
    category: "Assumption",
    title: "Working assumption",
    body: "Regulated data remains governed in Oracle-controlled production lanes while experimentation can be evaluated through a representative lakehouse workload.",
    tone: "emerald",
  },
  {
    id: "note-risk",
    category: "Risk",
    title: "Open risk",
    body: "Freshness requirements, existing Databricks spend, model serving concurrency, and data movement cost need validation before final architecture generation.",
    tone: "amber",
  },
] satisfies WhiteboardNote[]

export const whiteboardAiHook = {
  status: "Ready for local payload",
  target: "Sketch-to-architecture AI generation",
  signals: [
    "Canvas shapes and labels",
    "Architecture notes",
    "Debate Arena recommendation",
    "Generator assumptions",
  ],
  outputs: [
    "Candidate architecture nodes",
    "Detected integration paths",
    "Governance and risk annotations",
    "Architecture Generator seed payload",
  ],
} satisfies WhiteboardAiHook
