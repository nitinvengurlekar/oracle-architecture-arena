"use client"

import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  Layers3,
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
  useStoreApi,
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
import { cn } from "@/lib/utils"
import type {
  ArchitectureEdge,
  ArchitectureGeneratorBlueprint,
  ArchitectureGeneratorNode,
  ArchitectureNodeStatus,
  ArchitectureRecommendation,
  WorkbenchTone,
} from "@/types/workbench"

type ArchitectureFlowNodeData = Omit<ArchitectureGeneratorNode, "x" | "y">
type ArchitectureFlowNode = Node<ArchitectureFlowNodeData>

type ArchitectureHistoryItem = {
  id: string
  label: string
  description: string
  generatedAt: string
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
}

type EditableNodeField =
  | "label"
  | "detail"
  | "ociService"
  | "layer"
  | "rationale"
  | "status"

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

const nodeTypes = {
  ociService: OciArchitectureNode,
} satisfies NodeTypes

const proOptions = { hideAttribution: true }
const defaultViewport = { x: 26, y: 170, zoom: 0.42 }

function handleFlowError(code: string, message: string) {
  if (code !== "002") {
    console.warn(message)
  }
}

function FlowErrorInitializer() {
  const store = useStoreApi()

  useMemo(() => {
    store.setState({ onError: handleFlowError })
  }, [store])

  return null
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
  const architectureHistory = useMemo(
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

  return (
    <div className="grid gap-4 2xl:grid-cols-[1fr_430px]">
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
            const nextNodes = buildFlowNodes(nextHistoryItem.blueprint.nodes)

            setSelectedArchitectureId(architectureId)
            setNodes(nextNodes)
            setEdges(buildFlowEdges(nextHistoryItem.blueprint.edges))
            setSelectedNodeId(nextNodes[0]?.id ?? "")
            setGenerationVersion(1)
          }}
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
              <Badge variant="outline" className="rounded-md bg-white">
                Drag nodes or select one to edit
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[620px] bg-slate-50">
              <ReactFlowProvider>
                <FlowErrorInitializer />
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
                  <ArchitectureMiniMap
                    nodes={nodes}
                    selectedNodeId={normalizedSelectedNodeId}
                    onSelectNode={setSelectedNodeId}
                  />
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

      <aside className="flex flex-col gap-4">
        <ArchitectureSummaryPanel
          blueprint={activeBlueprint}
          recommendation={activeRecommendation}
          nodeCount={nodes.length}
        />
        <NodeInspector
          node={selectedNode}
          onUpdate={updateSelectedNode}
        />
      </aside>
    </div>
  )
}

function GeneratorCommandBar({
  blueprint,
  history,
  selectedArchitectureId,
  generationVersion,
  onSelectArchitecture,
  onRegenerate,
}: {
  blueprint: ArchitectureGeneratorBlueprint
  history: ArchitectureHistoryItem[]
  selectedArchitectureId: string
  generationVersion: number
  onSelectArchitecture: (architectureId: string) => void
  onRegenerate: () => void
}) {
  const selectedHistoryItem =
    history.find((item) => item.id === selectedArchitectureId) ?? history[0]

  return (
    <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
      <CardContent className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-md bg-red-600 text-white">
              Generated from Debate Arena
            </Badge>
            <Badge className="rounded-md bg-white text-slate-950">
              Version {generationVersion}
            </Badge>
            <Badge className="rounded-md bg-white text-slate-950">
              {blueprint.confidence}% confidence
            </Badge>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">
            {blueprint.title}
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            {blueprint.summary}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">
              Generated architecture history
            </div>
            <Select
              value={selectedArchitectureId}
              onValueChange={onSelectArchitecture}
            >
              <SelectTrigger className="min-h-11 w-full max-w-full rounded-md border-white/20 bg-white text-slate-950">
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
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {selectedHistoryItem.generatedAt} ·{" "}
              {selectedHistoryItem.description ?? blueprint.generatedFrom}
            </p>
            <Button
              variant="outline"
              className="w-full border-white/20 bg-white text-slate-950 hover:bg-slate-100"
              onClick={onRegenerate}
            >
              <WandSparkles className="size-4" />
              Reset from debate
            </Button>
          </div>
        </div>
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

function ArchitectureMiniMap({
  nodes,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: ArchitectureFlowNode[]
  selectedNodeId: string
  onSelectNode: (nodeId: string) => void
}) {
  const bounds = useMemo(() => {
    const xValues = nodes.map((node) => node.position.x)
    const yValues = nodes.map((node) => node.position.y)

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
    }
  }, [nodes])
  const xRange = Math.max(bounds.maxX - bounds.minX, 1)
  const yRange = Math.max(bounds.maxY - bounds.minY, 1)

  return (
    <div className="absolute bottom-4 right-4 z-10 w-60 rounded-md border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Architecture map
        </div>
        <Badge variant="outline" className="rounded-md bg-slate-50">
          {nodes.length} nodes
        </Badge>
      </div>
      <div className="relative mt-3 h-28 rounded-md border border-slate-200 bg-slate-50">
        {nodes.map((node) => {
          const tone = getToneClasses(statusTone[node.data.status])
          const isSelected = node.id === selectedNodeId
          const left = 8 + ((node.position.x - bounds.minX) / xRange) * 84
          const top = 10 + ((node.position.y - bounds.minY) / yRange) * 80

          return (
            <button
              key={node.id}
              type="button"
              title={node.data.ociService}
              aria-label={`Select ${node.data.ociService}`}
              onClick={() => onSelectNode(node.id)}
              className={cn(
                "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border transition-transform",
                tone.soft,
                isSelected
                  ? "scale-125 border-red-600 ring-2 ring-red-200"
                  : "border-slate-300 hover:scale-110"
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

function ArchitectureSummaryPanel({
  blueprint,
  recommendation,
  nodeCount,
}: {
  blueprint: ArchitectureGeneratorBlueprint
  recommendation: ArchitectureRecommendation
  nodeCount: number
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
      <CardContent className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Target className="size-4 text-red-600" />
            {blueprint.recommendationSource}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation.summary}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
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
