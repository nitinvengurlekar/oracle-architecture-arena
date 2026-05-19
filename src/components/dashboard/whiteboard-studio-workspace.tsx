"use client"

import { useEffect, useMemo, useState } from "react"
import type { Editor } from "tldraw"
import { createShapeId, Tldraw, toRichText } from "tldraw"
import type { LucideIcon } from "lucide-react"
import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  History,
  Layers3,
  Loader2,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  StickyNote,
  WandSparkles,
} from "lucide-react"

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
  WhiteboardSessionDetail,
  WhiteboardSessionSummary,
} from "@/lib/whiteboard-session-contract"
import type {
  WhiteboardAiHook,
  WhiteboardNote,
  WhiteboardNoteCategory,
  WhiteboardSignal,
  WorkbenchTone,
} from "@/types/workbench"

type DraftNote = {
  category: WhiteboardNoteCategory
  title: string
  body: string
}

type WhiteboardSessionListResponse = {
  items: WhiteboardSessionSummary[]
  source: "database" | "seeded-fallback"
  warning?: string
}

type WhiteboardSessionDetailResponse = {
  item: WhiteboardSessionDetail
  source: "database" | "seeded-fallback"
  warning?: string
}

const categoryTone = {
  Context: "blue",
  Assumption: "emerald",
  Risk: "amber",
  Decision: "red",
} satisfies Record<WhiteboardNoteCategory, WorkbenchTone>

const categoryOptions = [
  "Context",
  "Assumption",
  "Risk",
  "Decision",
] satisfies WhiteboardNoteCategory[]

const initialDraftNote = {
  category: "Decision",
  title: "",
  body: "",
} satisfies DraftNote

export function WhiteboardStudioWorkspace({
  initialNotes,
  signals,
  aiHook,
}: {
  initialNotes: WhiteboardNote[]
  signals: WhiteboardSignal[]
  aiHook: WhiteboardAiHook
}) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [shapeCount, setShapeCount] = useState(0)
  const [notes, setNotes] = useState(initialNotes)
  const [draftNote, setDraftNote] = useState<DraftNote>(initialDraftNote)
  const [exportStatus, setExportStatus] = useState("No export created")
  const [aiStatus, setAiStatus] = useState(aiHook.status)
  const [sessionTitle, setSessionTitle] = useState("Architecture sketch session")
  const [currentSessionId, setCurrentSessionId] = useState<string>()
  const [selectedSessionId, setSelectedSessionId] = useState<string>()
  const [sessions, setSessions] = useState<WhiteboardSessionSummary[]>([])
  const [persistenceStatus, setPersistenceStatus] = useState(
    "Not saved to the database yet"
  )
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      try {
        const response = await fetch("/api/whiteboard-sessions", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Unable to load saved whiteboard sessions.")
        }

        const payload = (await response.json()) as WhiteboardSessionListResponse

        if (cancelled) {
          return
        }

        setSessions(payload.items)

        if (payload.warning) {
          setPersistenceStatus(payload.warning)
        } else if (payload.items.length > 0) {
          setPersistenceStatus(`${payload.items.length} saved sessions available`)
        }
      } catch (error) {
        if (!cancelled) {
          setPersistenceStatus(getErrorMessage(error))
        }
      }
    }

    void loadSessions()

    return () => {
      cancelled = true
    }
  }, [])

  const aiPayloadSummary = useMemo(
    () => [
      `${shapeCount} canvas shapes`,
      `${notes.length} architecture notes`,
      `${signals.length} studio signals`,
      aiHook.target,
    ],
    [aiHook.target, notes.length, shapeCount, signals.length]
  )

  function handleCanvasMount(mountedEditor: Editor) {
    setEditor(mountedEditor)
    setShapeCount(mountedEditor.getCurrentPageShapeIds().size)

    return mountedEditor.store.listen(
      () => setShapeCount(mountedEditor.getCurrentPageShapeIds().size),
      { scope: "document" }
    )
  }

  async function saveSession() {
    if (!sessionTitle.trim()) {
      setPersistenceStatus("Give the whiteboard session a title before saving")
      return
    }

    setIsSavingSession(true)
    setPersistenceStatus("Saving whiteboard session")

    try {
      const response = await fetch("/api/whiteboard-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          existingId: currentSessionId,
          title: sessionTitle.trim(),
          snapshot: editor?.getSnapshot() ?? null,
          notes,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null

        throw new Error(payload?.error ?? "Unable to save whiteboard session.")
      }

      const payload = (await response.json()) as WhiteboardSessionDetailResponse
      const savedSummary = toSessionSummary(payload.item)

      setCurrentSessionId(payload.item.id)
      setSelectedSessionId(payload.item.id)
      setSessions((current) => mergeSessionSummary(current, savedSummary))
      setPersistenceStatus(`Saved "${payload.item.title}" to the database`)
    } catch (error) {
      setPersistenceStatus(getErrorMessage(error))
    } finally {
      setIsSavingSession(false)
    }
  }

  async function loadSession(id: string) {
    setSelectedSessionId(id)
    setIsLoadingSession(true)
    setPersistenceStatus("Loading saved whiteboard session")

    try {
      const response = await fetch(`/api/whiteboard-sessions/${id}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Unable to load saved whiteboard session.")
      }

      const payload = (await response.json()) as WhiteboardSessionDetailResponse

      setCurrentSessionId(payload.item.id)
      setSessionTitle(payload.item.title)
      setNotes(payload.item.notes)

      if (payload.item.snapshot && editor) {
        editor.loadSnapshot(
          payload.item.snapshot as Parameters<Editor["loadSnapshot"]>[0]
        )
        setShapeCount(editor.getCurrentPageShapeIds().size)
      }

      setPersistenceStatus(
        `Loaded "${payload.item.title}" from ${formatSessionTime(
          payload.item.updatedAt
        )}`
      )
    } catch (error) {
      setPersistenceStatus(getErrorMessage(error))
    } finally {
      setIsLoadingSession(false)
    }
  }

  function updateDraft<K extends keyof DraftNote>(
    key: K,
    value: DraftNote[K]
  ) {
    setDraftNote((current) => ({ ...current, [key]: value }))
  }

  function addNote() {
    if (!draftNote.title.trim() || !draftNote.body.trim()) {
      return
    }

    const note = {
      id: `note-${Date.now()}`,
      category: draftNote.category,
      title: draftNote.title.trim(),
      body: draftNote.body.trim(),
      tone: categoryTone[draftNote.category],
    } satisfies WhiteboardNote

    setNotes((current) => [note, ...current])
    setDraftNote(initialDraftNote)
  }

  function addNoteToCanvas(note: WhiteboardNote) {
    if (!editor) {
      setExportStatus("Canvas is still loading")
      return
    }

    const viewport = editor.getViewportPageBounds()
    const offset = shapeCount * 18

    editor
      .createShape({
        id: createShapeId(),
        type: "note",
        x: viewport.minX + 80 + offset,
        y: viewport.minY + 80 + offset,
        props: {
          align: "start",
          richText: toRichText(`${note.category}: ${note.title}\n${note.body}`),
          size: "s",
          verticalAlign: "start",
        },
      })
      .selectNone()

    setShapeCount(editor.getCurrentPageShapeIds().size)
    setExportStatus(`Added "${note.title}" to canvas`)
  }

  async function exportSketchSvg() {
    if (!editor) {
      setExportStatus("Canvas is still loading")
      return
    }

    const shapeIds = [...editor.getCurrentPageShapeIds()]

    if (!shapeIds.length) {
      setExportStatus("Add a sketch before SVG export")
      return
    }

    const result = await editor.getSvgString(shapeIds, {
      background: true,
      padding: 32,
    })

    if (!result) {
      setExportStatus("SVG export could not be created")
      return
    }

    downloadBlob(
      result.svg,
      "oracle-architecture-whiteboard.svg",
      "image/svg+xml"
    )
    setExportStatus(`Exported SVG with ${shapeIds.length} shapes`)
  }

  function exportStudioPackage() {
    const canvasSnapshot = editor?.getSnapshot() ?? null
    const payload = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      source: "Oracle Architecture Arena Whiteboard Studio",
      session: {
        id: currentSessionId ?? null,
        title: sessionTitle,
      },
      canvas: {
        shapeCount,
        snapshot: canvasSnapshot,
      },
      notes,
      aiHandoff: {
        status: aiStatus,
        target: aiHook.target,
        signals: aiHook.signals,
        outputs: aiHook.outputs,
        payloadSummary: aiPayloadSummary,
      },
    }

    downloadBlob(
      JSON.stringify(payload, null, 2),
      "oracle-architecture-whiteboard-package.json",
      "application/json"
    )
    setExportStatus(`Exported package with ${notes.length} notes`)
  }

  function prepareAiHandoff() {
    setAiStatus(
      `Prepared payload with ${shapeCount} shapes and ${notes.length} notes`
    )
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[1fr_420px]">
      <div className="flex flex-col gap-4">
        <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
          <CardContent className="grid gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-md bg-red-600 text-white">
                  tldraw canvas
                </Badge>
                <Badge className="rounded-md bg-white text-slate-950">
                  {shapeCount} shapes
                </Badge>
                <Badge className="rounded-md bg-white text-slate-950">
                  {notes.length} notes
                </Badge>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {sessionTitle}
              </h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
                Capture solution sketches, structured field notes, and a
                future-ready handoff payload for architecture generation.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:w-72">
              <Button
                variant="outline"
                className="border-white/20 bg-white text-slate-950 hover:bg-slate-100"
                onClick={exportSketchSvg}
              >
                <FileText className="size-4" />
                Export SVG
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white text-slate-950 hover:bg-slate-100"
                onClick={exportStudioPackage}
              >
                <Send className="size-4" />
                Export package
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
          <CardContent className="grid gap-4 py-4 xl:grid-cols-[1fr_280px_auto] xl:items-end">
            <label className="block">
              <span className="text-sm font-semibold text-slate-950">
                Whiteboard session name
              </span>
              <Input
                value={sessionTitle}
                onChange={(event) => setSessionTitle(event.target.value)}
                className="mt-2 rounded-md bg-slate-50"
                placeholder="Name this architecture sketch"
              />
            </label>
            <div>
              <div className="text-sm font-semibold text-slate-950">
                Saved sessions
              </div>
              <Select
                value={selectedSessionId}
                onValueChange={loadSession}
                disabled={sessions.length === 0 || isLoadingSession}
              >
                <SelectTrigger className="mt-2 h-10 w-full rounded-md bg-slate-50">
                  <SelectValue placeholder="Load previous session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
              <Button
                onClick={saveSession}
                disabled={isSavingSession || !sessionTitle.trim()}
              >
                {isSavingSession ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save session
              </Button>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <History className="size-4 shrink-0" />
                <span className="line-clamp-2">{persistenceStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-md border-0 bg-white shadow-sm ring-slate-200">
          <CardHeader className="rounded-t-md border-b border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Sketch canvas
                </div>
                <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                  Whiteboard Studio
                </CardTitle>
              </div>
              <Badge variant="outline" className="rounded-md bg-white">
                Database-backed workspace
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[650px] bg-white">
              <Tldraw
                persistenceKey="oracle-architecture-arena-whiteboard"
                onMount={handleCanvasMount}
              />
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-3 md:grid-cols-3">
          {signals.map((signal) => (
            <SignalCard key={signal.title} signal={signal} />
          ))}
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <NotesPanel
          draftNote={draftNote}
          notes={notes}
          onAddNote={addNote}
          onAddNoteToCanvas={addNoteToCanvas}
          onUpdateDraft={updateDraft}
        />
        <AiHookPanel
          aiHook={aiHook}
          aiPayloadSummary={aiPayloadSummary}
          aiStatus={aiStatus}
          exportStatus={exportStatus}
          onPrepare={prepareAiHandoff}
        />
      </aside>
    </div>
  )
}

function NotesPanel({
  draftNote,
  notes,
  onAddNote,
  onAddNoteToCanvas,
  onUpdateDraft,
}: {
  draftNote: DraftNote
  notes: WhiteboardNote[]
  onAddNote: () => void
  onAddNoteToCanvas: (note: WhiteboardNote) => void
  onUpdateDraft: <K extends keyof DraftNote>(
    key: K,
    value: DraftNote[K]
  ) => void
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Architecture note-taking
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              Session notes
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white">
            <StickyNote className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-semibold text-slate-950">
            Note category
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onUpdateDraft("category", category)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  draftNote.category === category
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-950">Title</span>
          <Input
            value={draftNote.title}
            onChange={(event) => onUpdateDraft("title", event.target.value)}
            className="mt-2 rounded-md bg-slate-50"
            placeholder="Deployment constraint, risk, or decision"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-950">Note</span>
          <Textarea
            value={draftNote.body}
            onChange={(event) => onUpdateDraft("body", event.target.value)}
            className="mt-2 min-h-28 resize-none rounded-md bg-slate-50 text-sm"
            placeholder="Capture the architecture observation"
          />
        </label>

        <Button
          className="w-full"
          onClick={onAddNote}
          disabled={!draftNote.title.trim() || !draftNote.body.trim()}
        >
          <StickyNote className="size-4" />
          Add architecture note
        </Button>

        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onAddToCanvas={() => onAddNoteToCanvas(note)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NoteCard({
  note,
  onAddToCanvas,
}: {
  note: WhiteboardNote
  onAddToCanvas: () => void
}) {
  const tone = getToneClasses(note.tone)

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="outline" className={cn("rounded-md", tone.soft)}>
          {note.category}
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add ${note.title} to canvas`}
          onClick={onAddToCanvas}
        >
          <Layers3 className="size-4" />
        </Button>
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-950">
        {note.title}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-600">{note.body}</p>
    </div>
  )
}

function AiHookPanel({
  aiHook,
  aiPayloadSummary,
  aiStatus,
  exportStatus,
  onPrepare,
}: {
  aiHook: WhiteboardAiHook
  aiPayloadSummary: string[]
  aiStatus: string
  exportStatus: string
  onPrepare: () => void
}) {
  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Future AI hook
            </div>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
              {aiHook.target}
            </CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <BrainCircuit className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusBlock
          icon={Sparkles}
          title="AI handoff status"
          body={aiStatus}
          tone="red"
        />
        <SummaryList
          title="Input signals"
          items={aiHook.signals}
          icon={CheckCircle2}
          tone="blue"
        />
        <SummaryList
          title="Target outputs"
          items={aiHook.outputs}
          icon={WandSparkles}
          tone="emerald"
        />
        <SummaryList
          title="Prepared payload"
          items={aiPayloadSummary}
          icon={ShieldCheck}
          tone="slate"
        />
        <StatusBlock
          icon={FileText}
          title="Export status"
          body={exportStatus}
          tone="amber"
        />
        <Button className="w-full" onClick={onPrepare}>
          <BrainCircuit className="size-4" />
          Prepare AI handoff
        </Button>
      </CardContent>
    </Card>
  )
}

function SignalCard({ signal }: { signal: WhiteboardSignal }) {
  const tone = getToneClasses(signal.tone)

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-md ring-1",
              tone.soft
            )}
          >
            <CheckCircle2 className="size-4" />
          </span>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {signal.status}
          </Badge>
        </div>
        <CardTitle className="pt-2 text-base font-semibold text-slate-950">
          {signal.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{signal.detail}</p>
      </CardContent>
    </Card>
  )
}

function StatusBlock({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: LucideIcon
  title: string
  body: string
  tone: WorkbenchTone
}) {
  const toneClass = getToneClasses(tone)

  return (
    <div className={cn("rounded-md border p-4", toneClass.border, toneClass.soft)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6">{body}</p>
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

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function toSessionSummary(
  session: WhiteboardSessionDetail
): WhiteboardSessionSummary {
  return {
    id: session.id,
    title: session.title,
    useCaseId: session.useCaseId,
    noteCount: session.noteCount,
    shapeCount: session.shapeCount,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

function mergeSessionSummary(
  sessions: WhiteboardSessionSummary[],
  nextSession: WhiteboardSessionSummary
) {
  return [
    nextSession,
    ...sessions.filter((session) => session.id !== nextSession.id),
  ]
}

function formatSessionTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Whiteboard action failed."
}
