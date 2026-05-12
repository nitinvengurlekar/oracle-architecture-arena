"use client"

import { Bell, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dashboardNavigation } from "@/lib/navigation"
import { getNavigationTitle } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function TopNavigation() {
  const pathname = usePathname()
  const title = getNavigationTitle(pathname)

  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
        <div className="md:hidden flex size-9 items-center justify-center rounded-md bg-red-600 text-white">
          <Sparkles className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Executive Workbench
          </div>
          <h1 className="truncate text-base font-semibold text-slate-950">
            {title}
          </h1>
        </div>

        <div className="hidden w-full max-w-md items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex">
          <Search className="size-4 text-slate-400" />
          <Input
            aria-label="Search workbench"
            placeholder="Search scenarios, competitors, workloads"
            className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-slate-200 px-4 py-2 md:hidden">
        {dashboardNavigation.map((item) => {
          const isActive = item.href === pathname

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-xs font-medium",
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700"
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
