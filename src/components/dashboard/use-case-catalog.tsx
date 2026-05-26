"use client"

import Link from "next/link"
import { ArrowRight, BookmarkCheck, Clock3, Sparkles, Target } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getToneClasses } from "@/lib/tone"
import { loadUseCaseCatalog } from "@/lib/use-case-catalog"
import { cn } from "@/lib/utils"
import type { ScoreboardItem, UseCaseCatalogItem } from "@/types/workbench"

export function UseCaseCatalog({
  items: controlledItems,
  hasLoaded: controlledHasLoaded,
  selectedId,
  onSelect,
  getReadinessItems,
}: {
  items?: UseCaseCatalogItem[]
  hasLoaded?: boolean
  selectedId?: string
  onSelect?: (id: string) => void
  getReadinessItems?: (item: UseCaseCatalogItem) => ScoreboardItem[]
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
          readinessItems={getReadinessItems?.(item)}
        />
      ))}
    </section>
  )
}

function UseCaseCatalogCard({
  item,
  isSelected,
  onSelect,
  readinessItems,
}: {
  item: UseCaseCatalogItem
  isSelected: boolean
  onSelect?: (id: string) => void
  readinessItems?: ScoreboardItem[]
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
          {isSelected ? (
            <Badge
              variant="outline"
              className="rounded-md border-red-200 bg-red-50 text-red-700"
            >
              Focused use case
            </Badge>
          ) : null}
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          {item.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock3 className="size-4" />
          Updated {formatDate(item.updatedAt)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="line-clamp-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {item.input.prompt}
        </div>
        {readinessItems ? (
          <ScenarioReadinessStrip
            items={readinessItems}
            showDetails={isSelected}
          />
        ) : null}
        <div
          className={cn(
            "rounded-md p-4",
            isSelected
              ? "border border-red-100 bg-red-50 text-slate-950"
              : "bg-slate-950 text-white"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles
              className={cn(
                "size-4",
                isSelected ? "text-red-600" : "text-red-300"
              )}
            />
            Generated battle-card headline
          </div>
          <p
            className={cn(
              "mt-2 line-clamp-2 text-sm leading-6",
              isSelected ? "text-slate-700" : "text-slate-100"
            )}
          >
            {item.brief.battleCardOutput.headline}
          </p>
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

function ScenarioReadinessStrip({
  items,
  showDetails,
}: {
  items: ScoreboardItem[]
  showDetails: boolean
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Scenario readiness
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <ReadinessMetric key={item.label} item={item} />
        ))}
      </div>
      {showDetails ? (
        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
          {items.map((item) => (
            <p key={item.label} className="text-xs leading-5 text-slate-600">
              <span className="font-semibold text-slate-900">
                {shortReadinessLabel(item.label)}:
              </span>{" "}
              {item.insight}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ReadinessMetric({ item }: { item: ScoreboardItem }) {
  const tone = getToneClasses(item.tone)
  const width = `${Math.min(item.score, 100)}%`

  return (
    <div
      className="rounded-md border border-slate-200 bg-slate-50 p-2"
      aria-label={`${item.label}: ${item.score}, target ${item.target}`}
      title={item.insight}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-slate-600">
          {shortReadinessLabel(item.label)}
        </div>
        <div className={cn("text-sm font-semibold", tone.text)}>
          {item.score}
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white">
        <div
          className={cn("h-full rounded-full", tone.accent)}
          style={{ width }}
        />
      </div>
    </div>
  )
}

function shortReadinessLabel(label: string) {
  return label
    .replace(" depth", "")
    .replace(" clarity", "")
    .replace(" coverage", "")
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
