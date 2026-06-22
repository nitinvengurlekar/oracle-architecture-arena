import type { LucideIcon } from "lucide-react"
import {
  Blocks,
  Bot,
  Code2,
  Database,
  GitBranch,
  Layers3,
  ServerCog,
  ShieldCheck,
} from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stackSections = [
  {
    title: "Application framework",
    eyebrow: "Frontend runtime",
    icon: Code2,
    items: [
      "Next.js 16.2.6 App Router",
      "React 19.2.4 client components",
      "TypeScript with strict component and data contracts",
      "Next build/dev workflow with Turbopack",
    ],
  },
  {
    title: "Interface system",
    eyebrow: "UI composition",
    icon: Layers3,
    items: [
      "Tailwind CSS 4 utility styling",
      "Radix UI and shadcn-style primitives",
      "Lucide React iconography",
      "Framer Motion for page transitions",
    ],
  },
  {
    title: "Workbench canvases",
    eyebrow: "Interactive surfaces",
    icon: Blocks,
    items: [
      "React Flow for generated architecture diagrams",
      "tldraw for Whiteboard Studio sketching",
      "Editable node cards and inspector panels",
      "Saved workbench outputs loaded through dashboard routes",
    ],
  },
  {
    title: "AI orchestration",
    eyebrow: "Generation layer",
    icon: Bot,
    items: [
      "OpenAI Responses API for structured workbench generation",
      "Role-specific Debate Arena agent instructions",
      "JSON schema output contracts validated before display",
      "Local fallback generation when live model calls are unavailable",
    ],
  },
  {
    title: "Data and persistence",
    eyebrow: "Storage layer",
    icon: Database,
    items: [
      "Oracle Database / ADB connectivity through node-oracledb 6.10.0",
      "Route handlers under src/app/api for saved scenarios and generated outputs",
      "Zod contracts for request and response validation",
      "Seeded fixtures and local corpus data for starter content",
    ],
  },
  {
    title: "Operations",
    eyebrow: "Project workflow",
    icon: ServerCog,
    items: [
      "npm scripts for dev, lint, build, start, and seeding",
      "Environment-based configuration through local and production env files",
      "Select AI / RAG index helper scripts for structural work",
      "VM deployment path using the same parent repo build output",
    ],
  },
] satisfies StackSection[]

const implementationNotes = [
  {
    title: "Single source-of-truth repo",
    body: "The application code lives in the parent project root. The ui and structural folders are workstream instruction lanes, not separate app roots.",
    icon: GitBranch,
  },
  {
    title: "Structured before rendered",
    body: "Generated assists, debates, blueprints, and saved records pass through typed contracts before the UI presents them.",
    icon: ShieldCheck,
  },
]

type StackSection = {
  title: string
  eyebrow: string
  icon: LucideIcon
  items: string[]
}

export default function AboutPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="About"
        description="Draft stack summary for the Oracle Architecture Arena workbench."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4 md:grid-cols-2">
          {stackSections.map((section) => (
            <StackCard key={section.title} section={section} />
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm">
            <CardHeader className="rounded-t-md border-b border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wide text-red-300">
                Review draft
              </div>
              <CardTitle className="mt-1 text-xl font-semibold">
                Stack description to confirm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <p>
                This page is intended to describe what the workbench is built
                on, not replace technical deployment notes.
              </p>
              <p>
                The wording should stay executive-readable while still naming
                the core implementation choices.
              </p>
            </CardContent>
          </Card>

          {implementationNotes.map((note) => {
            const Icon = note.icon

            return (
              <Card
                key={note.title}
                className="rounded-md border-0 bg-white shadow-sm ring-slate-200"
              >
                <CardContent className="p-4">
                  <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-700 ring-1 ring-red-100">
                    <Icon className="size-5" />
                  </span>
                  <div className="mt-3 text-sm font-semibold text-slate-950">
                    {note.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {note.body}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </aside>
      </section>
    </AnimatedPage>
  )
}

function StackCard({ section }: { section: StackSection }) {
  const Icon = section.icon

  return (
    <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
      <CardHeader className="rounded-t-md border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-700 ring-1 ring-red-100">
            <Icon className="size-5" />
          </span>
          <Badge variant="outline" className="rounded-md bg-slate-50">
            {section.eyebrow}
          </Badge>
        </div>
        <CardTitle className="pt-2 text-lg font-semibold text-slate-950">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {section.items.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
