export type StrategyDomain =
  | "database-modernization"
  | "ai-ml-platform"
  | "lakehouse-modernization"
  | "sovereign-deployment"

export type WorkbenchTone =
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "slate"
  | "violet"

export type ScenarioStage =
  | "Discovery"
  | "Positioning"
  | "Architecture"
  | "Executive Review"

export type ScenarioRisk = "Low" | "Medium" | "Elevated" | "Critical"

export type CompetitiveCompetitor =
  | "Databricks"
  | "Snowflake"
  | "AWS"
  | "Azure"
  | "Google Cloud"
  | "Other"

export type DiscoveryConfidence = "Sparse" | "Directional" | "Validated"

export interface NavigationItem {
  title: string
  href: string
  description: string
}

export interface ExecutiveMetric {
  label: string
  value: string
  change: string
  tone: WorkbenchTone
}

export interface StrategyDomainSummary {
  id: StrategyDomain
  title: string
  description: string
  activeScenarios: number
  executivePriority: number
  signal: string
  tone: WorkbenchTone
}

export interface Scenario {
  id: string
  title: string
  account: string
  domain: StrategyDomain
  stage: ScenarioStage
  competitor: string
  customerSignal: string
  priorityScore: number
  risk: ScenarioRisk
  drivers: string[]
  nextAction: string
}

export interface ScoreboardItem {
  label: string
  score: number
  target: number
  insight: string
  tone: WorkbenchTone
}

export interface CompetitiveAssistBrief {
  prompt: string
  competitor?: CompetitiveCompetitor
  domain?: StrategyDomain
  discoveryConfidence?: DiscoveryConfidence
  customerSignals: string[]
  inferredPriorities: string[]
  discoveryQuestions: string[]
  oracleOpportunities: string[]
  competitorStrengths: string[]
  competitorRisks: string[]
  recommendedTalkTrack: string[]
  battleCardGuidance: string[]
  battleCardOutput: {
    headline: string
    customerConcern: string
    oraclePosition: string
    landmine: string
    nextMove: string
  }
  feeds: {
    debateArena: string
    architectureGenerator: string
  }
}

export interface CompetitiveAssistInput {
  prompt: string
  competitor: CompetitiveCompetitor
  domain: StrategyDomain
  discoveryConfidence: DiscoveryConfidence
}

export type AssistGenerationMode = "llm" | "mock"

export type RagSourceType =
  | "oracle-capability"
  | "competitive-context"
  | "architecture-pattern"
  | "governance-pattern"

export interface RagDocument {
  id: string
  title: string
  sourceType: RagSourceType
  domain: StrategyDomain | "cross-domain"
  competitor?: CompetitiveCompetitor
  keywords: string[]
  excerpt: string
}

export interface RagReference {
  id: string
  title: string
  sourceType: RagSourceType
  excerpt: string
  score: number
}

export interface CompetitiveAssistGenerationResult {
  brief: CompetitiveAssistBrief
  mode: AssistGenerationMode
  model?: string
  ragContext: RagReference[]
  warning?: string
}

export interface UseCaseCatalogItem {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  input: CompetitiveAssistInput
  brief: CompetitiveAssistBrief
  generation: {
    mode: AssistGenerationMode
    model?: string
    warning?: string
  }
  ragContext: RagReference[]
}

export interface CustomerSignalChip {
  id: string
  label: string
  description: string
  input: CompetitiveAssistInput
}

export interface DebateAgent {
  id: string
  name: string
  role: string
  stance: string
  score: number
  tone: WorkbenchTone
}

export type DebateAgentRole = "oracle" | "competitor" | "judge"

export interface DebateAgentPanel {
  id: string
  role: DebateAgentRole
  name: string
  title: string
  organization: string
  objective: string
  response: string
  keyClaims: string[]
  watchItems: string[]
  confidence: number
  tone: WorkbenchTone
}

export interface DebateScore {
  criterion: string
  oracleScore: number
  competitorScore: number
  judgeWeight: number
  rationale: string
}

export interface ArchitectureRecommendation {
  verdict: string
  summary: string
  recommendedArchitecture: string
  whyOracle: string[]
  risksToResolve: string[]
  nextSteps: string[]
}

export interface ArchitectureDebate {
  scenario: string
  customerContext: string
  agents: {
    oracle: DebateAgentPanel
    competitor: DebateAgentPanel
    judge: DebateAgentPanel
  }
  scores: DebateScore[]
  recommendation: ArchitectureRecommendation
}

export interface DebateArenaGenerationInput {
  scenario: string
  customerContext: string
  competitor: CompetitiveCompetitor
  domain: StrategyDomain
  discoveryConfidence: DiscoveryConfidence
  assistBrief?: CompetitiveAssistBrief
}

export interface DebateArenaGenerationResult {
  debate: ArchitectureDebate
  mode: AssistGenerationMode
  model?: string
  reasoningEffort?: string
  ragContext: RagReference[]
  warning?: string
}

export interface ArchitectureNode {
  id: string
  label: string
  type: "input" | "platform" | "service" | "governance" | "output"
  detail: string
  x: number
  y: number
}

export interface ArchitectureEdge {
  id: string
  source: string
  target: string
  label: string
}

export type ArchitectureNodeStatus = "Generated" | "Review" | "Validated"

export interface ArchitectureGeneratorNode extends ArchitectureNode {
  ociService: string
  layer: string
  rationale: string
  status: ArchitectureNodeStatus
  tone: WorkbenchTone
}

export interface ArchitectureGeneratorMetric {
  label: string
  value: string
  detail: string
  tone: WorkbenchTone
}

export interface ArchitectureGeneratorBlueprint {
  id: string
  title: string
  generatedFrom: string
  summary: string
  recommendationSource: string
  confidence: number
  nodes: ArchitectureGeneratorNode[]
  edges: ArchitectureEdge[]
  metrics: ArchitectureGeneratorMetric[]
  assumptions: string[]
}

export interface WhiteboardSignal {
  title: string
  status: string
  detail: string
  tone: WorkbenchTone
}

export type WhiteboardNoteCategory =
  | "Context"
  | "Assumption"
  | "Risk"
  | "Decision"

export interface WhiteboardNote {
  id: string
  category: WhiteboardNoteCategory
  title: string
  body: string
  tone: WorkbenchTone
}

export interface WhiteboardAiHook {
  status: string
  target: string
  signals: string[]
  outputs: string[]
}
