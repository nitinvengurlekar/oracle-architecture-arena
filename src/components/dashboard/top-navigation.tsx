"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import { Bell, CheckCircle2, Clock, Database, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dashboardNavigation } from "@/lib/navigation"
import { getNavigationTitle } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const searchableItems = [
  ...dashboardNavigation.map((item) => ({
    ...item,
    keywords: `${item.title} ${item.description}`,
  })),
  {
    title: "Snowflake compete",
    href: "/competitive-se-assist",
    description: "Competitive guidance for analytics platform evaluations",
    keywords: "snowflake analytics warehouse compete competitive se assist",
  },
  {
    title: "Databricks lakehouse",
    href: "/competitive-se-assist",
    description: "Discovery and positioning for lakehouse pursuits",
    keywords: "databricks lakehouse aws s3 tableau looker competitive assist",
  },
  {
    title: "Saved use case catalog",
    href: "/scenarios",
    description: "Previously generated scenarios and customer contexts",
    keywords: "saved generated use case catalog scenario history",
  },
  {
    title: "Oracle AI Database and RAG",
    href: "/architecture-generator",
    description: "Architecture planning for future retrieval and NLQ work",
    keywords: "26ai ai database vector rag nlq agents architecture",
  },
]

const notifications = [
  {
    title: "ADB persistence is enabled",
    detail: "Scenarios, assists, debates, architectures, and whiteboards are wired for database storage.",
    href: "/scenarios",
    icon: Database,
  },
  {
    title: "Whiteboard sessions can be reloaded",
    detail: "Sketches and architecture notes now have a saved session path.",
    href: "/whiteboard-studio",
    icon: CheckCircle2,
  },
  {
    title: "26ai integration is queued",
    detail: "RAG, vector search, NLQ, and database agents are the next planned capability layer.",
    href: "/architecture-generator",
    icon: Clock,
  },
]

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getNavigationTitle(pathname)
  const [query, setQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return []
    }

    return searchableItems
      .filter((item) => item.keywords.toLowerCase().includes(normalizedQuery))
      .slice(0, 5)
  }, [query])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const destination = searchResults[0] ?? searchableItems[0]

    setIsSearchFocused(false)
    setQuery("")
    router.push(destination.href)
  }

  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
        <div className="md:hidden flex size-9 items-center justify-center rounded-md bg-red-600 text-white">
          <Sparkles className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-950">
            {title}
          </h1>
        </div>

        <form
          onSubmit={submitSearch}
          className="relative hidden w-full max-w-md lg:block"
        >
          <div
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5"
            title="Search now; future home for natural-language questions"
          >
            <Search className="size-4 text-slate-400" />
            <Input
              aria-label="Search workbench"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
              placeholder="Search or ask about a scenario"
              className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          {isSearchFocused && query.trim() ? (
            <div className="absolute right-0 top-12 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={`${item.title}-${item.href}`}
                    href={item.href}
                    onClick={() => {
                      setQuery("")
                      setIsSearchFocused(false)
                    }}
                    className="block border-b border-slate-100 px-3 py-2 last:border-b-0 hover:bg-slate-50"
                  >
                    <span className="block text-sm font-semibold text-slate-950">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {item.description}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-slate-600">
                  No match yet. Try Databricks, scenario, architecture, or RAG.
                </div>
              )}
            </div>
          ) : null}
        </form>

        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((current) => !current)}
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-600" />
          </Button>
          {showNotifications ? (
            <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 px-3 py-2">
                <div className="text-sm font-semibold text-slate-950">
                  Workbench updates
                </div>
                <div className="text-xs leading-5 text-slate-500">
                  Current status and useful next places to go.
                </div>
              </div>
              {notifications.map((notification) => {
                const Icon = notification.icon

                return (
                  <Link
                    key={notification.title}
                    href={notification.href}
                    onClick={() => setShowNotifications(false)}
                    className="flex gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0 hover:bg-slate-50"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700 ring-1 ring-red-100">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {notification.detail}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
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
