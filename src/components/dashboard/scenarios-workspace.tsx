"use client"

import Link from "next/link"
import { ArrowRight, PencilLine, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Scoreboard } from "@/components/dashboard/scoreboard"
import { UseCaseCatalog } from "@/components/dashboard/use-case-catalog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  competitiveCompetitors,
  competitiveDomains,
  discoveryConfidenceLevels,
} from "@/lib/competitive-assist"
import { readUseCaseCatalog } from "@/lib/use-case-catalog"
import type {
  CompetitiveAssistInput,
  CompetitiveCompetitor,
  DiscoveryConfidence,
  Scenario,
  ScoreboardItem,
  StrategyDomain,
  UseCaseCatalogItem,
} from "@/types/workbench"

type EditableTemplate = {
  id: string
  title: string
  account: string
  input: CompetitiveAssistInput
  drivers: string
}

export function ScenariosWorkspace({ scenarios }: { scenarios: Scenario[] }) {
  const [catalogItems, setCatalogItems] = useState<UseCaseCatalogItem[]>([])
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string>()
  const [templates, setTemplates] = useState<EditableTemplate[]>(() =>
    scenarios.map(createEditableTemplate)
  )
  const selectedUseCase = catalogItems.find((item) => item.id === selectedUseCaseId)
  const readinessItems = useMemo(
    () => createReadinessItems(selectedUseCase),
    [selectedUseCase]
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const items = readUseCaseCatalog()

      setCatalogItems(items)
      setSelectedUseCaseId((current) => current ?? items[0]?.id)
      setHasLoadedCatalog(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  function updateTemplate<K extends keyof EditableTemplate>(
    templateId: string,
    key: K,
    value: EditableTemplate[K]
  ) {
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId ? { ...template, [key]: value } : template
      )
    )
  }

  function updateTemplateInput<K extends keyof CompetitiveAssistInput>(
    templateId: string,
    key: K,
    value: CompetitiveAssistInput[K]
  ) {
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? { ...template, input: { ...template.input, [key]: value } }
          : template
      )
    )
  }

  function resetTemplates() {
    setTemplates(scenarios.map(createEditableTemplate))
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Saved generated use cases
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Local catalog entries remain available in this browser until a
                backend database is added.
              </p>
            </div>
            {catalogItems.length > 0 ? (
              <Badge variant="outline" className="rounded-md bg-slate-50">
                {catalogItems.length} saved
              </Badge>
            ) : null}
          </div>
          <UseCaseCatalog
            items={catalogItems}
            hasLoaded={hasLoadedCatalog}
            selectedId={selectedUseCaseId}
            onSelect={setSelectedUseCaseId}
          />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Editable pursuit templates
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Tune a template, then launch it into Competitive SE Assist as a
                starter prompt.
              </p>
            </div>
            <Button variant="outline" onClick={resetTemplates}>
              <RotateCcw className="size-4" />
              Reset templates
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {templates.map((template) => (
              <EditableTemplateCard
                key={template.id}
                template={template}
                onUpdate={updateTemplate}
                onInputUpdate={updateTemplateInput}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-950">
              Focused use case
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUseCase ? (
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-md bg-red-600 text-white">
                    {selectedUseCase.input.competitor}
                  </Badge>
                  <Badge variant="outline" className="rounded-md bg-slate-50">
                    {formatDomain(selectedUseCase.input.domain)}
                  </Badge>
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-950">
                  {selectedUseCase.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedUseCase.brief.battleCardOutput.headline}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600">
                Select or generate a use case to populate readiness scores.
              </p>
            )}
          </CardContent>
        </Card>
        <Scoreboard title="Scenario readiness" items={readinessItems} />
      </div>
    </section>
  )
}

function EditableTemplateCard({
  template,
  onUpdate,
  onInputUpdate,
}: {
  template: EditableTemplate
  onUpdate: <K extends keyof EditableTemplate>(
    templateId: string,
    key: K,
    value: EditableTemplate[K]
  ) => void
  onInputUpdate: <K extends keyof CompetitiveAssistInput>(
    templateId: string,
    key: K,
    value: CompetitiveAssistInput[K]
  ) => void
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-md bg-slate-50">
            Starter template
          </Badge>
          <PencilLine className="size-4 text-slate-400" />
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          <Input
            value={template.title}
            onChange={(event) =>
              onUpdate(template.id, "title", event.target.value)
            }
            aria-label="Template title"
            className="h-9 rounded-md bg-white text-base font-semibold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={template.account}
          onChange={(event) =>
            onUpdate(template.id, "account", event.target.value)
          }
          aria-label="Template account"
          className="rounded-md bg-slate-50"
        />
        <Textarea
          value={template.input.prompt}
          onChange={(event) =>
            onInputUpdate(template.id, "prompt", event.target.value)
          }
          aria-label="Template customer signal"
          className="min-h-28 resize-none rounded-md bg-slate-50 text-sm"
        />
        <div className="grid gap-2 md:grid-cols-3">
          <Select
            value={template.input.competitor}
            onValueChange={(value) =>
              onInputUpdate(
                template.id,
                "competitor",
                value as CompetitiveCompetitor
              )
            }
          >
            <SelectTrigger className="rounded-md bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {competitiveCompetitors.map((competitor) => (
                <SelectItem key={competitor} value={competitor}>
                  {competitor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={template.input.domain}
            onValueChange={(value) =>
              onInputUpdate(template.id, "domain", value as StrategyDomain)
            }
          >
            <SelectTrigger className="rounded-md bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {competitiveDomains.map((domain) => (
                <SelectItem key={domain.value} value={domain.value}>
                  {domain.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={template.input.discoveryConfidence}
            onValueChange={(value) =>
              onInputUpdate(
                template.id,
                "discoveryConfidence",
                value as DiscoveryConfidence
              )
            }
          >
            <SelectTrigger className="rounded-md bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {discoveryConfidenceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          value={template.drivers}
          onChange={(event) =>
            onUpdate(template.id, "drivers", event.target.value)
          }
          aria-label="Template drivers"
          className="rounded-md bg-slate-50"
        />
      </CardContent>
      <CardFooter className="justify-between rounded-b-md bg-white">
        <div className="text-xs font-medium text-slate-500">
          {template.account}
        </div>
        <Button asChild>
          <Link href={`/competitive-se-assist?${buildTemplateQuery(template)}`}>
            Start assist
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function createEditableTemplate(scenario: Scenario): EditableTemplate {
  return {
    id: scenario.id,
    title: scenario.title,
    account: scenario.account,
    drivers: scenario.drivers.join(", "),
    input: {
      prompt: scenario.customerSignal,
      competitor: normalizeCompetitor(scenario.competitor),
      domain: scenario.domain,
      discoveryConfidence: scenario.stage === "Discovery" ? "Sparse" : "Directional",
    },
  }
}

function buildTemplateQuery(template: EditableTemplate) {
  const params = new URLSearchParams({
    prompt: template.input.prompt,
    competitor: template.input.competitor,
    domain: template.input.domain,
    discoveryConfidence: template.input.discoveryConfidence,
  })

  return params.toString()
}

function createReadinessItems(
  item: UseCaseCatalogItem | undefined
): ScoreboardItem[] {
  if (!item) {
    return [
      {
        label: "Discovery depth",
        score: 0,
        target: 80,
        insight: "No generated use case is focused yet.",
        tone: "slate",
      },
      {
        label: "Positioning clarity",
        score: 0,
        target: 85,
        insight: "Select a saved use case to calculate Oracle positioning readiness.",
        tone: "slate",
      },
      {
        label: "Retrieval coverage",
        score: 0,
        target: 75,
        insight: "RAG context coverage will appear after a generated use case is selected.",
        tone: "slate",
      },
    ]
  }

  const confidenceScore = {
    Sparse: 42,
    Directional: 62,
    Validated: 78,
  } satisfies Record<DiscoveryConfidence, number>
  const sourceTypes = new Set(item.ragContext.map((reference) => reference.sourceType))

  return [
    {
      label: "Discovery depth",
      score: clamp(
        confidenceScore[item.input.discoveryConfidence] +
          item.brief.discoveryQuestions.length * 6
      ),
      target: 80,
      insight: `${item.brief.discoveryQuestions.length} discovery questions generated from ${item.input.discoveryConfidence.toLowerCase()} signal quality.`,
      tone: item.brief.discoveryQuestions.length >= 4 ? "emerald" : "amber",
    },
    {
      label: "Positioning clarity",
      score: clamp(
        item.brief.oracleOpportunities.length * 12 +
          item.brief.battleCardGuidance.length * 10 +
          (item.generation.mode === "llm" ? 16 : 6)
      ),
      target: 85,
      insight: `${item.brief.oracleOpportunities.length} Oracle positions and ${item.brief.battleCardGuidance.length} battle-card points are ready for field use.`,
      tone: item.generation.mode === "llm" ? "blue" : "amber",
    },
    {
      label: "Retrieval coverage",
      score: clamp(item.ragContext.length * 15 + sourceTypes.size * 8),
      target: 75,
      insight: `${item.ragContext.length} RAG references across ${sourceTypes.size} context type${sourceTypes.size === 1 ? "" : "s"}.`,
      tone: item.ragContext.length >= 4 ? "emerald" : "amber",
    },
  ]
}

function normalizeCompetitor(value: string): CompetitiveCompetitor {
  if (value.includes("AWS")) {
    return "AWS"
  }

  if (value.includes("Azure")) {
    return "Azure"
  }

  if (value.includes("Google")) {
    return "Google Cloud"
  }

  if (value.includes("Snowflake")) {
    return "Snowflake"
  }

  if (value.includes("Databricks")) {
    return "Databricks"
  }

  return "Other"
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function formatDomain(value: string) {
  return value.replaceAll("-", " ")
}
