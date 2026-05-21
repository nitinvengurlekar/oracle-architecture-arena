"use client"

import Link from "next/link"
import { ArrowRight, BookmarkCheck, Clock3, Sparkles, Target } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loadUseCaseCatalog } from "@/lib/use-case-catalog"
import { cn } from "@/lib/utils"
import type { UseCaseCatalogItem } from "@/types/workbench"

const statDescriptions = {
  Questions:
    "Discovery questions generated for the SE to ask next. Higher count usually means the use case has richer qualification coverage.",
  Positions:
    "Oracle positioning opportunities generated for this customer context. These are the main angles for field guidance.",
  "RAG refs":
    "Retrieved context references used to ground the assist. Today these come from the local RAG-ready corpus.",
} satisfies Record<string, string>

export function UseCaseCatalog({
  items: controlledItems,
  hasLoaded: controlledHasLoaded,
  selectedId,
  onSelect,
}: {
  items?: UseCaseCatalogItem[]
  hasLoaded?: boolean
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  const [localItems, setLocalItems] = useState<UseCaseCatalogItem[]>([])
  const [localHasLoaded, setLocalHasLoaded] = useState(false)
  const items = controlledItems ?? localItems
  const hasLoaded = controlledHasLoaded ?? localHasLoaded

  useEffect(() => {
    if (controlledItems) {
      return
    }

    let isActive = true
    const timeoutId = window.setTimeout(() => {
      void loadUseCaseCatalog().then((items) => {
        if (!isActive) {
          return
        }

        setLocalItems(items)
        setLocalHasLoaded(true)
      })
    }, 0)

    return () => {
      isActive = false
      window.clearTimeout(timeoutId)
    }
  }, [controlledItems])

  if (!hasLoaded) {
    return (
      <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
        <CardContent className="py-6 text-sm text-slate-600">
          Loading saved use cases...
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <BookmarkCheck className="size-5" />
          </div>
          <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
            No saved use cases yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Generate a Competitive SE Assist brief and it will appear here as a
            reusable catalog entry.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/competitive-se-assist">Create first use case</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <UseCaseCatalogCard
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
        />
      ))}
    </section>
  )
}

function UseCaseCatalogCard({
  item,
  isSelected,
  onSelect,
}: {
  item: UseCaseCatalogItem
  isSelected: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <Card
      className={cn(
        "rounded-md border-0 bg-white shadow-sm ring-slate-200",
        isSelected && "ring-2 ring-red-600"
      )}
    >
      <CardHeader className="rounded-t-md">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-md bg-red-600 text-white">
            {item.input.competitor}
          </Badge>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {formatDomain(item.input.domain)}
          </Badge>
          <Badge variant="secondary" className="rounded-md">
            {item.generation.mode === "llm" ? "OpenAI LLM" : "Local fallback"}
          </Badge>
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          {item.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock3 className="size-4" />
          Updated {formatDate(item.updatedAt)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {item.input.prompt}
        </div>
        <div className="rounded-md bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-red-300" />
            Generated battle-card headline
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-100">
            {item.brief.battleCardOutput.headline}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <CatalogStat
            label="Questions"
            value={item.brief.discoveryQuestions.length}
            description={statDescriptions.Questions}
          />
          <CatalogStat
            label="Positions"
            value={item.brief.oracleOpportunities.length}
            description={statDescriptions.Positions}
          />
          <CatalogStat
            label="RAG refs"
            value={item.ragContext.length}
            description={statDescriptions["RAG refs"]}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-2 rounded-b-md bg-white">
        <div className="flex gap-2">
          {onSelect ? (
            <Button
              variant={isSelected ? "secondary" : "outline"}
              onClick={() => onSelect(item.id)}
            >
              <Target className="size-4" />
              {isSelected ? "Focused" : "Focus"}
            </Button>
          ) : null}
          <Button asChild>
            <Link href={`/competitive-se-assist?useCaseId=${item.id}`}>
              Open generated output
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function CatalogStat({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div
      className="group relative rounded-md border border-slate-200 bg-white p-3 outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      tabIndex={0}
      aria-label={`${label}: ${description}`}
      title={description}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-950">{value}</div>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md bg-slate-950 p-3 text-left text-xs leading-5 text-white shadow-lg group-hover:block group-focus-visible:block">
        {description}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDomain(value: string) {
  return value.replaceAll("-", " ")
}
