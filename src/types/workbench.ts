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

export interface WhiteboardSignal {
  title: string
  status: string
  detail: string
  tone: WorkbenchTone
}
