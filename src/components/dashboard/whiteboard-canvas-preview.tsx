"use client"

import { Tldraw } from "tldraw"

export function WhiteboardCanvasPreview() {
  return (
    <div className="h-[560px] overflow-hidden rounded-md border border-slate-200 bg-white">
      <Tldraw persistenceKey="oracle-architecture-arena-whiteboard" />
    </div>
  )
}
