"use client"

import { useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from "reactflow"

import type {
  ArchitectureEdge,
  ArchitectureNode,
} from "@/types/workbench"

const nodeColors = {
  input: "#ef4444",
  platform: "#2563eb",
  service: "#7c3aed",
  governance: "#059669",
  output: "#111827",
}

const flowNodeTypes = {} satisfies NodeTypes
const flowEdgeTypes = {} satisfies EdgeTypes
const proOptions = { hideAttribution: true }

function handleFlowError(code: string, message: string) {
  if (code !== "002") {
    console.warn(message)
  }
}

export function ArchitectureFlowPreview({
  nodes,
  edges,
}: {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}) {
  const flowNodes = useMemo<Node[]>(
    () =>
      nodes.map((node) => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: (
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-950">
                {node.label}
              </div>
              <div className="mt-1 text-xs leading-4 text-slate-500">
                {node.detail}
              </div>
            </div>
          ),
        },
        style: {
          border: `1px solid ${nodeColors[node.type]}`,
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          minWidth: 190,
          padding: 12,
        },
      })),
    [nodes]
  )

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge) => ({
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
          strokeWidth: 1.5,
        },
        labelStyle: {
          fill: "#475569",
          fontSize: 11,
          fontWeight: 600,
        },
      })),
    [edges]
  )

  return (
    <div className="h-[520px] overflow-hidden rounded-md border border-slate-200 bg-white">
      <ReactFlowProvider>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={flowNodeTypes}
          edgeTypes={flowEdgeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={proOptions}
          onError={handleFlowError}
        >
          <Background color="#cbd5e1" gap={24} />
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
