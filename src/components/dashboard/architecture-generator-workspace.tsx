"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  WandSparkles,
} from "lucide-react"
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "reactflow"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getToneClasses } from "@/lib/tone"
import { loadUseCaseCatalog } from "@/lib/use-case-catalog"
import { cn } from "@/lib/utils"
import type {
  ArchitectureEdge,
  ArchitectureGeneratorBlueprint,
  ArchitectureGeneratorNode,
  ArchitectureNodeStatus,
  ArchitectureRecommendation,
  UseCaseCatalogItem,
  WorkbenchTone,
} from "@/types/workbench"

type ArchitectureFlowNodeData = Omit<ArchitectureGeneratorNode, "x" | "y">
type ArchitectureFlowNode = Node<ArchitectureFlowNodeData>

type ArchitectureHistoryItem = {
  id: string
  label: string
  description: string
  generatedAt: string
  useCaseId?: string
  debateRunId?: string
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
}

type ArchitectureBlueprintsApiResponse = {
  items: ArchitectureHistoryItem[]
  source: "database" | "seeded-fallback"
  warning?: string
}

type ArchitectureBlueprintSaveResponse = {
  item: ArchitectureHistoryItem
  source: "database"
}

type EditableNodeField =
  | "label"
  | "detail"
  | "ociService"
  | "layer"
  | "rationale"
  | "status"

type SummaryPanelSize = "comfortable" | "compact" | "hidden"

const summaryPanelOptions = [
  { value: "comfortable", label: "Full" },
  { value: "compact", label: "Compact" },
  { value: "hidden", label: "Hide" },
] satisfies Array<{ value: SummaryPanelSize; label: string }>

const nodeTypeIcons = {
  input: Database,
  platform: Layers3,
  service: Bot,
  governance: ShieldCheck,
  output: FileText,
} satisfies Record<ArchitectureGeneratorNode["type"], LucideIcon>

const nodeTypeLabels = {
  input: "Source",
  platform: "Platform",
  service: "Service",
  governance: "Control",
  output: "Output",
} satisfies Record<ArchitectureGeneratorNode["type"], string>

const statusTone = {
  Generated: "slate",
  Review: "amber",
  Validated: "emerald",
} satisfies Record<ArchitectureNodeStatus, WorkbenchTone>

const statusDescriptions = {
  Generated:
    "Drafted by the generator and ready for architecture review.",
  Review:
    "Needs an SE, architect, or customer-facing review before it is trusted.",
  Validated:
    "Accepted for the current architecture draft and ready to carry forward.",
} satisfies Record<ArchitectureNodeStatus, string>

const statusOptions = ["Generated", "Review", "Validated"] satisfies
  ArchitectureNodeStatus[]

const proOptions = { hideAttribution: true }
const defaultViewport = { x: 26, y: 170, zoom: 0.42 }

function handleFlowError(code: string, message: string) {
  if (code !== "002") {
    console.warn(message)
  }
}

export function ArchitectureGeneratorWorkspace({
  blueprint,
  recommendation,
  history,
}: {
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
  history?: ArchitectureHistoryItem[]
}) {
  const fallbackHistory = useMemo(
    () =>
      history?.length
        ? history
        : [
            {
              id: blueprint.id,
              label: blueprint.title,
              description: blueprint.generatedFrom,
              generatedAt: "Current draft",
              blueprint,
              recommendation,
            },
          ],
    [blueprint, history, recommendation]
  )
  const [catalogItems, setCatalogItems] = useState<UseCaseCatalogItem[]>([])
  const [selectedUseCaseId, setSelectedUseCaseId] = useState("")
  const [persistedHistory, setPersistedHistory] = useState<
    ArchitectureHistoryItem[]
  >([])
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false)
  const [persistenceMessage, setPersistenceMessage] = useState<string>()
  const architectureHistory = useMemo(
    () => mergeArchitectureHistory(persistedHistory, fallbackHistory),
    [fallbackHistory, persistedHistory]
  )
  const [selectedArchitectureId, setSelectedArchitectureId] = useState(
    architectureHistory[0]?.id ?? blueprint.id
  )
  const normalizedSelectedArchitectureId = architectureHistory.some(
    (item) => item.id === selectedArchitectureId
  )
    ? selectedArchitectureId
    : architectureHistory[0]?.id ?? blueprint.id
  const activeHistoryItem =
    architectureHistory.find(
      (item) => item.id === normalizedSelectedArchitectureId
    ) ??
    architectureHistory[0]
  const activeBlueprint = activeHistoryItem.blueprint
  const activeRecommendation = activeHistoryItem.recommendation
  const initialNodes = useMemo(
    () => buildFlowNodes(activeBlueprint.nodes),
    [activeBlueprint.nodes]
  )
  const initialEdges = useMemo(
    () => buildFlowEdges(activeBlueprint.edges),
    [activeBlueprint.edges]
  )
  const [nodes, setNodes, onNodesChange] =
    useNodesState<ArchitectureFlowNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState(
    initialNodes[0]?.id ?? ""
  )
  const [generationVersion, setGenerationVersion] = useState(1)
  const normalizedSelectedNodeId = nodes.some(
    (node) => node.id === selectedNodeId
  )
    ? selectedNodeId
    : nodes[0]?.id ?? ""

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === normalizedSelectedNodeId),
    [nodes, normalizedSelectedNodeId]
  )
  const nodeCards = useMemo(() => nodes.map((node) => node.data), [nodes])
  const [summaryPanelSize, setSummaryPanelSize] =
    useState<SummaryPanelSize>("comfortable")
  const nodeTypes = useMemo<NodeTypes>(
    () => ({ ociService: OciArchitectureNode }),
    []
  )
  const isSummaryCompact = summaryPanelSize === "compact"
  const isSummaryHidden = summaryPanelSize === "hidden"
  const workspaceLayoutClass = cn(
    "grid gap-4",
    isSummaryHidden
      ? "2xl:grid-cols-1"
      : isSummaryCompact
        ? "2xl:grid-cols-[minmax(0,1fr)_320px]"
        : "2xl:grid-cols-[minmax(0,1fr)_430px]"
  )

  const applyArchitectureSelection = useCallback(
    (historyItem: ArchitectureHistoryItem) => {
      const nextNodes = buildFlowNodes(historyItem.blueprint.nodes)

      setSelectedArchitectureId(historyItem.id)
      setNodes(nextNodes)
      setEdges(buildFlowEdges(historyItem.blueprint.edges))
      setSelectedNodeId(nextNodes[0]?.id ?? "")
      setGenerationVersion(1)
    },
    [setEdges, setNodes]
  )

  useEffect(() => {
    let isActive = true

    void loadUseCaseCatalog().then((items) => {
      if (!isActive) {
        return
      }

      setCatalogItems(items)
      setSelectedUseCaseId((current) => current || items[0]?.id || "")
    })

    void fetch("/api/architecture-blueprints?limit=50")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((result: ArchitectureBlueprintsApiResponse | undefined) => {
        if (!isActive || !result || result.source !== "database") {
          return
        }

        setPersistedHistory(result.items)

        if (result.items[0]) {
          applyArchitectureSelection(result.items[0])
        }
      })
      .catch(() => {
        if (isActive) {
          setPersistenceMessage(
            "Architecture history is using the local baseline until ADB history is available."
          )
        }
      })

    return () => {
      isActive = false
    }
  }, [applyArchitectureSelection])

  function updateSelectedNode<K extends EditableNodeField>(
    field: K,
    value: ArchitectureFlowNodeData[K]
  ) {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === normalizedSelectedNodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    )
  }

  function regenerateFromDebate() {
    const nextNodes = buildFlowNodes(activeBlueprint.nodes)

    setNodes(nextNodes)
    setEdges(buildFlowEdges(activeBlueprint.edges))
    setSelectedNodeId(nextNodes[0]?.id ?? "")
    setGenerationVersion((version) => version + 1)
  }

  async function generateFromSelectedUseCase() {
    if (!selectedUseCaseId) {
      setPersistenceMessage("Select a saved scenario before generating an architecture.")
      return
    }

    setIsGeneratingBlueprint(true)
    setPersistenceMessage(undefined)

    try {
      const response = await fetch("/api/architecture-blueprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ useCaseId: selectedUseCaseId }),
      })
      const result = (await response.json()) as
        | ArchitectureBlueprintSaveResponse
        | { error?: string }

      if (!response.ok || !("item" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to generate architecture blueprint."
        )
      }

      setPersistedHistory((current) =>
        mergeArchitectureHistory([result.item], current)
      )
      applyArchitectureSelection(result.item)
      setPersistenceMessage("Generated and saved architecture blueprint to ADB.")
    } catch {
      setPersistenceMessage(
        "Architecture blueprint generation did not complete. The current draft remains visible."
      )
    } finally {
      setIsGeneratingBlueprint(false)
    }
  }

  return (
    <div className={workspaceLayoutClass}>
      <div className="flex flex-col gap-4">
        <GeneratorCommandBar
          blueprint={activeBlueprint}
          history={architectureHistory}
          selectedArchitectureId={normalizedSelectedArchitectureId}
          generationVersion={generationVersion}
          onSelectArchitecture={(architectureId) => {
            const nextHistoryItem =
              architectureHistory.find((item) => item.id === architectureId) ??
              architectureHistory[0]
            applyArchitectureSelection(nextHistoryItem)
          }}
          catalogItems={catalogItems}
          selectedUseCaseId={selectedUseCaseId}
          isGeneratingBlueprint={isGeneratingBlueprint}
          persistenceMessage={persistenceMessage}
          onSelectUseCase={setSelectedUseCaseId}
          onGenerateFromUseCase={generateFromSelectedUseCase}
          onRegenerate={regenerateFromDebate}
        />

        <Card className="overflow-hidden rounded-md border-0 bg-white shadow-sm ring-slate-200">
          <CardHeader className="rounded-t-md border-b border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  ReactFlow diagram generation
                </div>
                <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                  Generated OCI architecture
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge variant="outline" className="rounded-md bg-white">
                  Drag nodes or select one to edit
                </Badge>
                <div
                  className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1"
                  title="Change how much horizontal space the summary and node inspector panel use."
                >
                  <span className="px-2 text-xs font-semibold text-slate-500">
                    Panel
                  </span>
                  {summaryPanelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={summaryPanelSize === option.value}
                      onClick={() => setSummaryPanelSize(option.value)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
                        summaryPanelSize === option.value
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-white"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={cn(
                "bg-slate-50",
                isSummaryHidden ? "h-[720px]" : "h-[620px]"
              )}
            >
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  defaultViewport={defaultViewport}
                  fitView
                  fitViewOptions={{ padding: 0.16 }}
                  minZoom={0.35}
                  maxZoom={1.2}
                  nodesConnectable={false}
                  preventScrolling={false}
                  zoomOnScroll={false}
                  proOptions={proOptions}
                  onError={handleFlowError}
                >
                  <Background color="#cbd5e1" gap={24} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </CardContent>
        </Card>

        <OciArchitectureCards
          nodes={nodeCards}
          selectedNodeId={normalizedSelectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      {!isSummaryHidden ? (
        <aside className="flex min-w-0 flex-col gap-4">
          <ArchitectureSummaryPanel
            blueprint={activeBlueprint}
            recommendation={activeRecommendation}
            nodeCount={nodes.length}
            isCompact={isSummaryCompact}
          />
          <NodeInspector
            node={selectedNode}
            onUpdate={updateSelectedNode}
          />
        </aside>
      ) : null}
    </div>
  )
}

function GeneratorCommandBar({
  blueprint,
  history,
  selectedArchitectureId,
  catalogItems,
  selectedUseCaseId,
  generationVersion,
  isGeneratingBlueprint,
  persistenceMessage,
  onSelectArchitecture,
  onSelectUseCase,
  onGenerateFromUseCase,
  onRegenerate,
}: {
  blueprint: ArchitectureGeneratorBlueprint
  history: ArchitectureHistoryItem[]
  selectedArchitectureId: string
  catalogItems: UseCaseCatalogItem[]
  selectedUseCaseId: string
  generationVersion: number
  isGeneratingBlueprint: boolean
  persistenceMessage?: string
  onSelectArchitecture: (architectureId: string) => void
  onSelectUseCase: (useCaseId: string) => void
  onGenerateFromUseCase: () => void
  onRegenerate: () => void
}) {
  const selectedHistoryItem =
    history.find((item) => item.id === selectedArchitectureId) ?? history[0]

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-md bg-red-600 text-white">
                Generated from Debate Arena
              </Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">
                Version {generationVersion}
              </Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">
                {blueprint.confidence}% confidence
              </Badge>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              {blueprint.title}
            </h3>
          </div>
          <div className="max-w-sm text-right text-xs leading-5 text-slate-500">
            <div className="font-semibold uppercase tracking-wide text-slate-400">
              Loaded output
            </div>
            <div className="truncate font-medium text-slate-700">
              {selectedHistoryItem.description ?? blueprint.generatedFrom}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(220px,1.25fr)_auto_minmax(220px,1fr)_auto] lg:items-end">
          <label className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Scenario input
            </span>
            <Select
              value={selectedUseCaseId}
              onValueChange={onSelectUseCase}
              disabled={catalogItems.length === 0}
            >
              <SelectTrigger className="mt-2 min-h-11 w-full max-w-full rounded-md bg-white text-slate-950">
                <SelectValue placeholder="Select saved scenario" />
              </SelectTrigger>
              <SelectContent className="max-w-[min(30rem,calc(100vw-2rem))]">
                {catalogItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            className="h-11 bg-red-600 text-white hover:bg-red-700"
            onClick={onGenerateFromUseCase}
            disabled={isGeneratingBlueprint || catalogItems.length === 0}
          >
            {isGeneratingBlueprint ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <WandSparkles className="size-4" />
            )}
            {isGeneratingBlueprint ? "Generating" : "Generate"}
          </Button>

          <label className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Saved architecture
            </span>
            <Select
              value={selectedArchitectureId}
              onValueChange={onSelectArchitecture}
            >
              <SelectTrigger className="mt-2 min-h-11 w-full max-w-full rounded-md bg-white text-slate-950">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-[min(28rem,calc(100vw-2rem))]">
                {history.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            variant="outline"
            className="h-11 bg-white text-slate-950 hover:bg-slate-100"
            onClick={onRegenerate}
          >
            <WandSparkles className="size-4" />
            Reset
          </Button>
        </div>

        {persistenceMessage ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs leading-5 text-slate-600">
            {persistenceMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function OciArchitectureNode({
  data,
  selected,
}: NodeProps<ArchitectureFlowNodeData>) {
  const Icon = nodeTypeIcons[data.type]
  const tone = getToneClasses(data.tone)
  const status = getToneClasses(statusTone[data.status])

  return (
    <div
      className={cn(
        "w-64 overflow-hidden rounded-md border bg-white shadow-sm transition-shadow",
        selected
          ? "border-red-600 shadow-lg ring-2 ring-red-100"
          : "border-slate-200"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-white !bg-slate-500"
      />
      <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 text-white">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-600">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">
            {data.ociService}
          </div>
          <div className="text-[11px] text-slate-300">{data.layer}</div>
        </div>
      </div>
      <div className="space-y-3 p-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            {data.label}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {data.detail}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn("rounded-md", tone.soft)}>
            {nodeTypeLabels[data.type]}
          </Badge>
          <Badge variant="outline" className={cn("rounded-md", status.soft)}>
            {data.status}
          </Badge>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-white !bg-slate-500"
      />
    </div>
  )
}

function OciArchitectureCards({
  nodes,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: ArchitectureFlowNodeData[]
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => {
        const Icon = nodeTypeIcons[node.type]
        const tone = getToneClasses(node.tone)
        const isSelected = selectedNodeId === node.id

        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelectNode(node.id)}
            className={cn(
              "rounded-md border bg-white p-4 text-left shadow-sm transition-colors",
              isSelected
                ? "border-red-600 ring-2 ring-red-100"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md ring-1",
                  tone.soft
                )}
              >
                <Icon className="size-5" />
              </span>
              <Badge variant="outline" className="rounded-md bg-slate-50">
                {node.status}
              </Badge>
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-950">
              {node.ociService}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              {node.layer}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {node.label}
            </p>
          </button>
        )
      })}
    </section>
  )
}

function ArchitectureSummaryPanel({
  blueprint,
  recommendation,
  nodeCount,
  isCompact,
}: {
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
  nodeCount: number
  isCompact: boolean
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Architecture summary
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              Debate recommendation integrated
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white">
            <Sparkles className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "space-y-4",
          isCompact && "2xl:max-h-[660px] 2xl:overflow-y-auto 2xl:pr-3"
        )}
      >
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Target className="size-4 text-red-600" />
            {blueprint.recommendationSource}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {blueprint.summary}
          </p>
        </div>

        <div
          className={cn(
            "grid gap-2",
            isCompact ? "grid-cols-1" : "grid-cols-3"
          )}
        >
          {blueprint.metrics.map((metric) => (
            <MetricTile key={metric.label} metric={metric} />
          ))}
        </div>

        <SummaryBlock
          icon={Layers3}
          title="Recommended architecture"
          body={recommendation.recommendedArchitecture}
        />
        <SummaryList
          title="Generator assumptions"
          items={blueprint.assumptions}
          icon={CheckCircle2}
          tone="blue"
        />
        <SummaryList
          title="Debate risks carried forward"
          items={recommendation.risksToResolve}
          icon={TriangleAlert}
          tone="amber"
        />

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-950">
              Generated nodes
            </span>
            <span className="font-semibold text-red-700">{nodeCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricTile({
  metric,
}: {
  metric: ArchitectureGeneratorBlueprint["metrics"][number]
}) {
  const tone = getToneClasses(metric.tone)

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{metric.label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", tone.text)}>
        {metric.value}
      </div>
      <div className="mt-1 text-xs leading-4 text-slate-500">
        {metric.detail}
      </div>
    </div>
  )
}

function NodeInspector({
  node,
  onUpdate,
}: {
  node: ArchitectureFlowNode | undefined
  onUpdate: <K extends EditableNodeField>(
    field: K,
    value: ArchitectureFlowNodeData[K]
  ) => void
}) {
  if (!node) {
    return null
  }

  const status = getToneClasses(statusTone[node.data.status])

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Editable nodes
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              Node inspector
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <FileText className="size-5" />
            </span>
            <Badge variant="outline" className={cn("rounded-md", status.soft)}>
              {node.data.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <EditableField
          label="Display name"
          value={node.data.label}
          onChange={(value) => onUpdate("label", value)}
        />
        <EditableField
          label="OCI service card"
          value={node.data.ociService}
          onChange={(value) => onUpdate("ociService", value)}
        />
        <EditableField
          label="Architecture layer"
          value={node.data.layer}
          onChange={(value) => onUpdate("layer", value)}
        />
        <EditableTextArea
          label="Node detail"
          value={node.data.detail}
          onChange={(value) => onUpdate("detail", value)}
        />
        <EditableTextArea
          label="Recommendation rationale"
          value={node.data.rationale}
          onChange={(value) => onUpdate("rationale", value)}
        />
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-950">
              Review status
            </div>
            <Badge variant="outline" className={cn("rounded-md", status.soft)}>
              Current: {node.data.status}
            </Badge>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <StatusButton
                key={status}
                status={status}
                isSelected={node.data.status === status}
                onClick={() => onUpdate("status", status)}
              />
            ))}
          </div>
          <div className={cn("mt-3 rounded-md border p-3", status.soft)}>
            <div className="text-sm font-semibold">
              {node.data.status}
            </div>
            <p className="mt-1 text-xs leading-5">
              {statusDescriptions[node.data.status]}
            </p>
          </div>
        </div>
        <SummaryBlock
          icon={Gauge}
          title="Why this node exists"
          body={node.data.rationale}
        />
      </CardContent>
    </Card>
  )
}

function StatusButton({
  status,
  isSelected,
  onClick,
}: {
  status: ArchitectureNodeStatus
  isSelected: boolean
  onClick: () => void
}) {
  const tone = getToneClasses(statusTone[status])

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        isSelected
          ? tone.soft
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {status}
    </button>
  )
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 rounded-md bg-slate-50"
      />
    </label>
  )
}

function EditableTextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-950">{label}</span>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 resize-none rounded-md bg-slate-50 text-sm"
      />
    </label>
  )
}

function SummaryBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon
  title: string
  body: string
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Icon className="size-4 text-red-600" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  )
}

function SummaryList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string
  items: string[]
  icon: LucideIcon
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div>
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ring-1",
                toneClass.soft
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function buildFlowNodes(
  architectureNodes: ArchitectureGeneratorNode[]
): ArchitectureFlowNode[] {
  return architectureNodes.map(({ x, y, ...node }) => ({
    id: node.id,
    type: "ociService",
    position: { x, y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: node,
  }))
}

function buildFlowEdges(architectureEdges: ArchitectureEdge[]): Edge[] {
  return architectureEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#64748b",
    },
    style: {
      stroke: "#64748b",
      strokeWidth: 1.6,
    },
    labelStyle: {
      fill: "#475569",
      fontSize: 11,
      fontWeight: 600,
    },
  }))
}

function mergeArchitectureHistory(
  primaryItems: ArchitectureHistoryItem[],
  secondaryItems: ArchitectureHistoryItem[]
) {
  const seenIds = new Set<string>()
  const items: ArchitectureHistoryItem[] = []

  for (const item of [...primaryItems, ...secondaryItems]) {
    if (seenIds.has(item.id)) {
      continue
    }

    seenIds.add(item.id)
    items.push(item)
  }

  return items
}
