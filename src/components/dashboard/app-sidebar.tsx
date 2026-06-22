"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Blocks,
  BrainCircuit,
  ClipboardList,
  DatabaseZap,
  Info,
  LayoutDashboard,
  PenTool,
  Swords,
} from "lucide-react"

import {
  competitiveAssistWorkflowTabs,
  dashboardNavigation,
  getCompetitiveAssistWorkflowTab,
} from "@/lib/navigation"
import { cn } from "@/lib/utils"

const navigationIcons = {
  About: Info,
  Dashboard: LayoutDashboard,
  Scenarios: ClipboardList,
  "Competitive SE Assist": Swords,
  "Debate Arena": BrainCircuit,
  "Architecture Generator": Blocks,
  "Whiteboard Studio": PenTool,
}

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeAssistTab = getCompetitiveAssistWorkflowTab(
    searchParams.get("assistTab")
  )
  const primaryNavigation = dashboardNavigation.filter(
    (item) => item.title !== "Dashboard" && item.title !== "About"
  )
  const overviewNavigation = dashboardNavigation.filter(
    (item) => item.title === "Dashboard" || item.title === "About"
  )

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          title="Executive Architecture Decision Simulation"
          aria-label="Oracle Architecture Arena: Executive Architecture Decision Simulation"
        >
          <div className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white shadow-sm">
            <DatabaseZap className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-950">
              Oracle
            </div>
            <div className="text-sm font-medium text-slate-600">
              Architecture Arena
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {primaryNavigation.map((item) => (
          <SidebarNavigationItem
            key={item.href}
            item={item}
            isActive={item.href === pathname}
            activeAssistTab={activeAssistTab}
            searchParams={searchParams}
          />
        ))}

        <div className="my-3 border-t border-slate-200 pt-3">
          {overviewNavigation.map((item) => (
            <SidebarNavigationItem
              key={item.href}
              item={item}
              isActive={item.href === pathname}
              activeAssistTab={activeAssistTab}
              searchParams={searchParams}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}

function SidebarNavigationItem({
  item,
  isActive,
  activeAssistTab,
  searchParams,
}: {
  item: (typeof dashboardNavigation)[number]
  isActive: boolean
  activeAssistTab: ReturnType<typeof getCompetitiveAssistWorkflowTab>
  searchParams: ReturnType<typeof useSearchParams>
}) {
  const Icon = navigationIcons[item.title as keyof typeof navigationIcons]

  return (
    <div>
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-start gap-3 rounded-md px-3 py-3 text-sm transition-colors",
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            isActive ? "text-white" : "text-slate-500 group-hover:text-red-600"
          )}
        />
        <span>
          <span className="block font-medium">{item.title}</span>
          <span
            className={cn(
              "mt-0.5 block text-xs leading-5",
              isActive ? "text-slate-300" : "text-slate-500"
            )}
          >
            {item.description}
          </span>
        </span>
      </Link>

      {item.title === "Competitive SE Assist" && isActive ? (
        <div className="mb-5 ml-7 mt-2 space-y-1 border-l border-slate-200 pl-3">
          {competitiveAssistWorkflowTabs.map((tab) => {
            const isTabActive = activeAssistTab === tab.id

            return (
              <Link
                key={tab.id}
                href={getAssistTabHref(tab.id, searchParams)}
                className={cn(
                  "block rounded-md px-3 py-2 text-xs transition-colors",
                  isTabActive
                    ? "bg-red-50 font-semibold text-red-700 ring-1 ring-red-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                <span className="block leading-4">{tab.title}</span>
                <span
                  className={cn(
                    "mt-0.5 block leading-4",
                    isTabActive ? "text-red-600/80" : "text-slate-400"
                  )}
                >
                  {tab.description}
                </span>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function getAssistTabHref(
  tabId: ReturnType<typeof getCompetitiveAssistWorkflowTab>,
  searchParams: ReturnType<typeof useSearchParams>
) {
  const nextParams = new URLSearchParams(searchParams.toString())

  nextParams.set("assistTab", tabId)

  return `/competitive-se-assist?${nextParams.toString()}`
}
