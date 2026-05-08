"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Blocks,
  Bot,
  BrainCircuit,
  ClipboardList,
  DatabaseZap,
  LayoutDashboard,
  PenTool,
  Swords,
} from "lucide-react"

import { dashboardNavigation } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const navigationIcons = {
  Dashboard: LayoutDashboard,
  Scenarios: ClipboardList,
  "Competitive SE Assist": Swords,
  "Debate Arena": BrainCircuit,
  "Architecture Generator": Blocks,
  "Whiteboard Studio": PenTool,
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
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
        {dashboardNavigation.map((item) => {
          const Icon = navigationIcons[item.title as keyof typeof navigationIcons]
          const isActive = item.href === pathname

          return (
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
          )
        })}
      </nav>

      <div className="m-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Bot className="size-4 text-red-600" />
          SE Assist signal
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Incomplete customer inputs are routed through discovery inference before
          entering the debate and architecture flows.
        </p>
      </div>
    </aside>
  )
}
