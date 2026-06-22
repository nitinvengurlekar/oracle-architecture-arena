import type { NavigationItem } from "@/types/workbench"

export const dashboardNavigation = [
  {
    title: "Competitive SE Assist",
    href: "/competitive-se-assist",
    description: "Battle-card guidance from incomplete signals",
  },
  {
    title: "Debate Arena",
    href: "/debate-arena",
    description: "Multi-agent strategy review",
  },
  {
    title: "Architecture Generator",
    href: "/architecture-generator",
    description: "Blueprint and implementation draft",
  },
  {
    title: "Scenarios",
    href: "/scenarios",
    description: "Saved use case catalog",
  },
  {
    title: "Whiteboard Studio",
    href: "/whiteboard-studio",
    description: "Sketch-to-architecture canvas",
  },
  {
    title: "Dashboard",
    href: "/",
    description: "Workbench overview",
  },
  {
    title: "About",
    href: "/about",
    description: "Stack and implementation notes",
  },
] satisfies NavigationItem[]

export const competitiveAssistWorkflowTabs = [
  {
    id: "customer-scenario-analysis",
    title: "Customer Scenario Analysis",
    href: "/competitive-se-assist?assistTab=customer-scenario-analysis",
    description: "Capture scenario and generate field assist",
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    href: "/competitive-se-assist?assistTab=competitor-analysis",
    description: "Tune competitor and domain lens",
  },
] as const

export type CompetitiveAssistWorkflowTabId =
  (typeof competitiveAssistWorkflowTabs)[number]["id"]

export function getCompetitiveAssistWorkflowTab(
  value: string | null | undefined
): CompetitiveAssistWorkflowTabId {
  return competitiveAssistWorkflowTabs.some((tab) => tab.id === value)
    ? (value as CompetitiveAssistWorkflowTabId)
    : "customer-scenario-analysis"
}

export function getNavigationTitle(pathname: string) {
  const activeItem =
    dashboardNavigation.find((item) => item.href === pathname) ??
    dashboardNavigation[0]

  return activeItem.title
}
