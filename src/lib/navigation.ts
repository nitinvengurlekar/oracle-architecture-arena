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
    title: "Scenarios",
    href: "/scenarios",
    description: "Saved use case catalog",
  },
  {
    title: "Architecture Generator",
    href: "/architecture-generator",
    description: "Blueprint and implementation draft",
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
] satisfies NavigationItem[]

export function getNavigationTitle(pathname: string) {
  const activeItem =
    dashboardNavigation.find((item) => item.href === pathname) ??
    dashboardNavigation[0]

  return activeItem.title
}
