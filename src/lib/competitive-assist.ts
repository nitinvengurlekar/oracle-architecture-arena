import { competitiveAssistBrief } from "@/data/mock-workbench"
import type {
  CompetitiveAssistBrief,
  CompetitiveAssistInput,
  CompetitiveCompetitor,
  CustomerSignalChip,
  DiscoveryConfidence,
  StrategyDomain,
} from "@/types/workbench"

type DomainProfile = {
  signals: string[]
  priorities: string[]
  questions: string[]
  opportunities: string[]
  talkTrack: string[]
  generatorFeed: string
}

type CompetitorProfile = {
  strengths: string[]
  risks: string[]
  guidance: string[]
  landmine: string
}

export const competitiveCompetitors = [
  "Databricks",
  "Snowflake",
  "AWS",
  "Azure",
  "Google Cloud",
  "Other",
] satisfies CompetitiveCompetitor[]

export const discoveryConfidenceLevels = [
  "Sparse",
  "Directional",
  "Validated",
] satisfies DiscoveryConfidence[]

export const competitiveDomains = [
  {
    value: "lakehouse-modernization",
    label: "Data platform / lakehouse",
  },
  {
    value: "database-modernization",
    label: "Oracle database modernization",
  },
  {
    value: "ai-ml-platform",
    label: "AI/ML platform strategy",
  },
  {
    value: "sovereign-deployment",
    label: "Government / sovereign deployment",
  },
] satisfies Array<{ value: StrategyDomain; label: string }>

export const customerSignalChips = [
  {
    id: "databricks-lakehouse",
    label: "Databricks lakehouse",
    description: "Sparse signal from a data platform evaluation.",
    input: {
      prompt: "Customer is evaluating Databricks for a lakehouse.",
      competitor: "Databricks",
      domain: "lakehouse-modernization",
      discoveryConfidence: "Sparse",
    },
  },
  {
    id: "snowflake-analytics",
    label: "Snowflake analytics",
    description: "Oracle remains system of record while analytics standardization is in flight.",
    input: {
      prompt:
        "Customer wants to standardize analytics on Snowflake while Oracle remains the system of record.",
      competitor: "Snowflake",
      domain: "lakehouse-modernization",
      discoveryConfidence: "Directional",
    },
  },
  {
    id: "azure-ai",
    label: "Azure AI",
    description: "AI platform conversation with governance and regulated data concerns.",
    input: {
      prompt:
        "Customer is considering Azure AI for governed GenAI across regulated business units.",
      competitor: "Azure",
      domain: "ai-ml-platform",
      discoveryConfidence: "Directional",
    },
  },
  {
    id: "aws-modernization",
    label: "AWS modernization",
    description: "Database modernization comparison against managed AWS database paths.",
    input: {
      prompt:
        "Customer is comparing AWS managed database options against Oracle database modernization.",
      competitor: "AWS",
      domain: "database-modernization",
      discoveryConfidence: "Validated",
    },
  },
  {
    id: "sovereign-cloud",
    label: "Sovereign cloud",
    description: "Government deployment conversation with residency and operator controls.",
    input: {
      prompt:
        "Government customer needs sovereign cloud controls but is also reviewing hyperscaler regional options.",
      competitor: "Other",
      domain: "sovereign-deployment",
      discoveryConfidence: "Directional",
    },
  },
] satisfies CustomerSignalChip[]

const domainProfiles = {
  "lakehouse-modernization": {
    signals: [
      "Lakehouse modernization",
      "Oracle data gravity",
      "Analytics and AI convergence",
      "Governance and run-cost unknown",
    ],
    priorities: [
      "Unified data engineering, analytics, and AI workflows across open data.",
      "Cost governance as lakehouse workloads move from pilot to production.",
      "Clear integration between systems of record and analytic serving layers.",
    ],
    questions: [
      "Which workloads are driving the evaluation: BI, ML, streaming, regulatory reporting, or consolidation?",
      "What Oracle data sources are in scope, and what freshness is required for each workload?",
      "Which team owns production operations after the initial lakehouse pilot?",
    ],
    opportunities: [
      "Anchor the strategy around Oracle data gravity, GoldenGate integration, and governed analytics on OCI.",
      "Position Autonomous Database, OCI Data Lake, and OCI AI Services as a production operating model, not only a data science workspace.",
      "Quantify data movement, concurrency, and governance costs before the customer standardizes on a separate control plane.",
    ],
    talkTrack: [
      "Acknowledge the customer wants faster analytics and AI experimentation.",
      "Reframe the decision around production lakehouse operations, Oracle data gravity, governance, and predictable cost.",
      "Offer to compare one representative workload side by side before architecture selection.",
    ],
    generatorFeed:
      "Generate a lakehouse modernization blueprint with Oracle data gravity, governance, and AI service integration.",
  },
  "database-modernization": {
    signals: [
      "Core database modernization",
      "Availability and resilience pressure",
      "Migration risk sensitivity",
      "Rewrite avoidance likely",
    ],
    priorities: [
      "Lower modernization risk while preserving critical transaction behavior.",
      "High availability, resilience, performance, and operational simplicity.",
      "A staged migration plan that avoids unnecessary application rewrites.",
    ],
    questions: [
      "Which databases are candidates for modernization, and what are their availability targets?",
      "What pain is strongest today: cost, performance, patching, scaling, skills, or resilience?",
      "Is the customer open to managed database operations, or do they require platform-level control?",
    ],
    opportunities: [
      "Lead with Exadata, Autonomous Database, RAC, Data Guard, and Oracle migration tooling where the estate already depends on Oracle semantics.",
      "Separate infrastructure modernization from application rewrites so the path feels lower risk.",
      "Frame Oracle as the fastest route to measurable resilience and performance gains for existing Oracle workloads.",
    ],
    talkTrack: [
      "Separate the modernization goal from a risky application rewrite.",
      "Center the discussion on proven Oracle workload behavior, resilience, and migration sequencing.",
      "Ask for the top two database pain points so the team can build an outcome-based modernization path.",
    ],
    generatorFeed:
      "Generate a phased Oracle database modernization blueprint with HA, migration sequencing, and operating model tradeoffs.",
  },
  "ai-ml-platform": {
    signals: [
      "AI/ML platform strategy",
      "Governance before scale",
      "Enterprise data dependency",
      "GPU and model operations questions",
    ],
    priorities: [
      "Move AI experiments into governed production workflows.",
      "Connect model use cases to enterprise data, auditability, and cost controls.",
      "Secure GPU and AI service capacity without creating another isolated platform.",
    ],
    questions: [
      "Which AI use cases are approved for production, and which are still experimentation?",
      "What model governance, audit, lineage, and data residency controls are mandatory?",
      "Where do the features, documents, and business records needed for AI currently live?",
    ],
    opportunities: [
      "Position OCI AI Services, Data Science, vector search, and database integration as a governed AI operating platform.",
      "Tie AI strategy to Oracle data, security policy, and production deployment patterns.",
      "Use workload-specific economics to distinguish prototypes from production AI scale.",
    ],
    talkTrack: [
      "Validate the AI ambition and distinguish experiments from approved production use cases.",
      "Tie the platform decision to trusted enterprise data, model governance, auditability, and cost controls.",
      "Suggest a first-use-case architecture that tests data access, controls, and inference economics.",
    ],
    generatorFeed:
      "Generate an AI platform strategy blueprint with model governance, vector search, data controls, and GPU placement.",
  },
  "sovereign-deployment": {
    signals: [
      "Sovereign deployment",
      "Residency constraints",
      "Operator control requirements",
      "Accreditation path unknown",
    ],
    priorities: [
      "Data residency, operational sovereignty, auditability, and deployment autonomy.",
      "A cloud model that can satisfy public-sector procurement and accreditation.",
      "Clear separation of regulated workloads from lower-risk shared services.",
    ],
    questions: [
      "Which workloads require sovereign controls, and which can run in standard commercial regions?",
      "Who must operate the environment, and what access restrictions apply to cloud provider personnel?",
      "Which accreditation, residency, encryption, and audit requirements are non-negotiable?",
    ],
    opportunities: [
      "Position OCI Dedicated Region, Oracle Alloy, sovereign regions, and air-gapped patterns where autonomy is central.",
      "Keep deployment model, operator control, and audit evidence in the first architecture conversation.",
      "Show how Oracle can preserve cloud economics while meeting stricter public-sector control requirements.",
    ],
    talkTrack: [
      "Treat sovereignty as an operating model issue, not only a region choice.",
      "Surface residency, operator access, accreditation, and audit evidence requirements before discussing services.",
      "Position Oracle deployment options as a way to preserve cloud capability while meeting local control requirements.",
    ],
    generatorFeed:
      "Generate a sovereign deployment blueprint with residency zones, operator controls, compliance evidence, and workload tiers.",
  },
} satisfies Record<StrategyDomain, DomainProfile>

const competitorProfiles = {
  Databricks: {
    strengths: [
      "Strong data engineering and data science mindshare.",
      "Simple lakehouse narrative for customers consolidating analytics stacks.",
      "Notebook-first collaboration can accelerate early experimentation.",
    ],
    risks: [
      "Production governance and residency controls may require additional architecture layers.",
      "Cost predictability can become difficult as concurrency and model workloads scale.",
      "Oracle system-of-record integration may create data movement and latency tradeoffs.",
    ],
    guidance: [
      "Acknowledge Databricks' data science strength, then redirect to governed production operations.",
      "Ask for one representative workload and compare data movement, control, and run-cost assumptions.",
    ],
    landmine:
      "Do not dismiss the notebook and data science experience; use it as the bridge to production controls.",
  },
  Snowflake: {
    strengths: [
      "Strong executive recognition for governed analytics and warehouse simplicity.",
      "Clear consumption model and broad partner ecosystem.",
      "Mature SQL analytics experience for business-facing teams.",
    ],
    risks: [
      "Advanced AI, operational data, and app-adjacent workloads can spread across multiple services.",
      "Data egress and duplication may increase when Oracle systems remain the operational source.",
      "Sovereign deployment needs can narrow viable patterns.",
    ],
    guidance: [
      "Respect Snowflake's analytics simplicity and test whether the customer also needs operational modernization.",
      "Tie Oracle positioning to data gravity, AI adjacency, and end-to-end workload economics.",
    ],
    landmine:
      "Do not debate warehouse features in isolation; connect the discussion to operational data and architecture scope.",
  },
  AWS: {
    strengths: [
      "Broad service catalog and procurement familiarity.",
      "Strong developer ecosystem and cloud-native reference patterns.",
      "Multiple managed data and AI services for greenfield teams.",
    ],
    risks: [
      "Oracle workload modernization can fragment across several AWS services.",
      "License, performance, and migration assumptions may be hard to compare cleanly.",
      "Regulated deployment controls may require custom integration and governance effort.",
    ],
    guidance: [
      "Move the conversation from generic cloud breadth to Oracle workload outcomes.",
      "Quantify modernization risk, licensing posture, and operational ownership before architecture selection.",
    ],
    landmine:
      "Do not let service breadth become the only buying criterion; force workload-specific modernization comparison.",
  },
  Azure: {
    strengths: [
      "Strong enterprise relationships and Microsoft ecosystem alignment.",
      "Compelling AI narrative with productivity and developer tooling.",
      "Familiar identity and workplace integration for many customers.",
    ],
    risks: [
      "Oracle-heavy estates still need a credible database modernization and performance path.",
      "AI platform decisions can outrun data governance and residency readiness.",
      "Sovereign controls may vary by region and operating model.",
    ],
    guidance: [
      "Connect AI ambition to where trusted enterprise data lives today.",
      "Use Oracle Database@Azure, OCI, and sovereign options selectively based on workload constraints.",
    ],
    landmine:
      "Do not counter Microsoft relationship strength head-on; connect the AI story to trusted data and controls.",
  },
  "Google Cloud": {
    strengths: [
      "Strong analytics, AI, and data engineering brand.",
      "Appealing managed services for AI-native teams.",
      "Credible open data and Kubernetes story.",
    ],
    risks: [
      "Oracle estate modernization may remain a separate workstream.",
      "Executive buyers may need clearer migration, support, and operating model assurances.",
      "Regulated deployment patterns can require more design validation.",
    ],
    guidance: [
      "Avoid debating AI brand alone; bring the discussion back to enterprise systems, data controls, and modernization sequence.",
      "Ask whether the customer is optimizing for experimentation, production governance, or operational modernization.",
    ],
    landmine:
      "Do not get trapped in a generic AI brand comparison; anchor on production data architecture.",
  },
  Other: {
    strengths: [
      "The competitor may have a narrow workload fit or incumbent relationship.",
      "Customer stakeholders may value perceived neutrality or existing skills.",
      "The evaluation may be shaped by procurement timing more than technical fit.",
    ],
    risks: [
      "Incomplete discovery can hide decision criteria that favor Oracle.",
      "Narrow tools can create operational gaps across data, AI, and governance.",
      "Architecture choices may be made before workload economics are understood.",
    ],
    guidance: [
      "Clarify decision criteria before challenging the competitor directly.",
      "Map Oracle opportunities to business outcomes, data gravity, and deployment control.",
    ],
    landmine:
      "Do not challenge an unknown competitor before clarifying who owns the decision criteria.",
  },
} satisfies Record<CompetitiveCompetitor, CompetitorProfile>

const confidenceGuidance = {
  Sparse:
    "Discovery is sparse; treat every conclusion as a hypothesis and prioritize qualification questions.",
  Directional:
    "Discovery is directional; proceed with a recommended position while keeping explicit assumptions visible.",
  Validated:
    "Discovery is validated; focus the output on executive guidance, risks, and architecture handoff.",
} satisfies Record<DiscoveryConfidence, string>

export function generateCompetitiveAssistBrief(
  input: CompetitiveAssistInput
): CompetitiveAssistBrief {
  const prompt = input.prompt.trim() || competitiveAssistBrief.prompt
  const domain = domainProfiles[input.domain]
  const competitor = competitorProfiles[input.competitor]

  return {
    prompt,
    competitor: input.competitor,
    domain: input.domain,
    discoveryConfidence: input.discoveryConfidence,
    customerSignals: [
      ...domain.signals,
      `${input.discoveryConfidence} discovery`,
      `${input.competitor} in evaluation`,
    ],
    inferredPriorities: [
      ...domain.priorities,
      confidenceGuidance[input.discoveryConfidence],
    ],
    discoveryQuestions: domain.questions,
    oracleOpportunities: domain.opportunities,
    competitorStrengths: competitor.strengths,
    competitorRisks: competitor.risks,
    battleCardGuidance: [
      ...competitor.guidance,
      "Feed the strongest unresolved assumption into Debate Arena before generating the final architecture.",
    ],
    recommendedTalkTrack: domain.talkTrack,
    battleCardOutput: {
      headline: `${input.competitor} evaluation: lead with Oracle workload outcomes, not generic platform claims.`,
      customerConcern:
        "The customer has signaled a platform direction before fully exposing decision criteria, workload economics, operating ownership, and governance requirements.",
      oraclePosition:
        domain.opportunities[0],
      landmine: competitor.landmine,
      nextMove:
        "Capture one representative workload, qualify decision criteria, and route the brief into Debate Arena and Architecture Generator.",
    },
    feeds: {
      debateArena: `Seed agents for ${input.competitor}, Oracle modernization, cloud economics, security, and customer operating model assumptions.`,
      architectureGenerator: domain.generatorFeed,
    },
  }
}
