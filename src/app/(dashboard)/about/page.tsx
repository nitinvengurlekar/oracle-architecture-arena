import {
  Blocks,
  BrainCircuit,
  Database,
  MessageSquareText,
  Search,
  ShieldCheck,
  Swords,
} from "lucide-react"

import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const capabilityCards = [
  {
    title: "Turn incomplete signals into guidance",
    body: "Helps sales engineers and architects convert partial customer context into structured strategy guidance.",
    icon: MessageSquareText,
  },
  {
    title: "Generate competitive field output",
    body: "Produces discovery questions, Oracle positioning, competitor strengths, risks, talk tracks, and battle-card guidance.",
    icon: Swords,
  },
  {
    title: "Run an architecture debate",
    body: "Compares three perspectives: Oracle Architect Agent, Competitor Architect Agent, and Neutral CTO Judge.",
    icon: BrainCircuit,
  },
  {
    title: "Create blueprint recommendations",
    body: "Generates editable architecture blueprints from saved scenarios and Debate Arena recommendations.",
    icon: Blocks,
  },
  {
    title: "Persist reusable work",
    body: "Stores scenarios and generated outputs in Oracle Autonomous Database so teams can return to prior work.",
    icon: Database,
  },
  {
    title: "Prepare for 26ai expansion",
    body: "Sets up future RAG, vector search, database agents, and natural-language querying capabilities.",
    icon: Search,
  },
]

const trialSteps = [
  "Open Competitive SE Assist to enter a customer situation or load an existing scenario.",
  "Generate a field assist to create discovery guidance and battle-card style output.",
  "Open Scenarios to browse existing sample customer scenarios and saved work.",
  "Open Debate Arena, select the same scenario, and generate a debate review.",
  "Open Architecture Generator, select the scenario, and generate an architecture blueprint.",
  "Revisit Scenarios later to find saved use cases and generated outputs.",
]

export default function AboutPage() {
  return (
    <AnimatedPage>
      <PageHeader
        eyebrow="About"
        title="Executive Architecture Decision Simulation"
        description="Oracle Architecture Arena is an AI-powered workbench for moving from incomplete customer context to competitive strategy, architecture debate, and reusable architecture outputs."
        actions={
          <Button asChild className="bg-red-600 text-white hover:bg-red-700">
            <a href="/competitive-se-assist">Start with SE Assist</a>
          </Button>
        }
      />

      <Tabs defaultValue="what" className="gap-4">
        <TabsList className="w-full justify-start rounded-md bg-white p-1 shadow-sm ring-1 ring-slate-200 md:w-fit">
          <TabsTrigger value="what" className="px-4 py-2">
            What it does
          </TabsTrigger>
          <TabsTrigger value="try" className="px-4 py-2">
            How to try it
          </TabsTrigger>
          <TabsTrigger value="flow" className="px-4 py-2">
            Workbench flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="what">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {capabilityCards.map((card) => {
              const Icon = card.icon

              return (
                <Card
                  key={card.title}
                  className="rounded-md border-0 bg-white shadow-sm ring-slate-200"
                >
                  <CardHeader className="rounded-t-md">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-700 ring-1 ring-red-100">
                        <Icon className="size-5" />
                      </span>
                      <Badge variant="outline" className="rounded-md bg-slate-50">
                        AI workbench
                      </Badge>
                    </div>
                    <CardTitle className="pt-2 text-base font-semibold text-slate-950">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-slate-600">{card.body}</p>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        </TabsContent>

        <TabsContent value="try">
          <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
            <CardHeader className="rounded-t-md border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Recommended first run
                  </div>
                  <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                    Start with the SE Assist workflow
                  </CardTitle>
                </div>
                <Badge className="rounded-md bg-slate-950 text-white">
                  6 steps
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {trialSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-600 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow">
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-md border-0 bg-slate-950 text-white shadow-sm ring-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white">
                    <Swords className="size-5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Primary entry point
                    </div>
                    <CardTitle className="mt-1 text-xl font-semibold text-white">
                      Competitive SE Assist
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-300">
                  The app is designed to begin with incomplete customer context.
                  The SE Assistant and Discovery Agent infer likely priorities,
                  expose gaps, and create the structured scenario used by the
                  rest of the workbench.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-md border-0 bg-white shadow-sm ring-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Persistent decision path
                    </div>
                    <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                      Scenario to debate to blueprint
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  Saved scenarios feed Debate Arena and Architecture Generator,
                  then remain available in the catalog. This lets teams revisit
                  prior use cases instead of recreating the same work for demos,
                  reviews, and future 26ai retrieval workflows.
                </p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </AnimatedPage>
  )
}
