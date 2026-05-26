import { AnimatedPage } from "@/components/dashboard/animated-page"
import { PageHeader } from "@/components/dashboard/page-header"
import { WhiteboardStudioWorkspace } from "@/components/dashboard/whiteboard-studio-workspace"
import {
  whiteboardAiHook,
  whiteboardNotes,
  whiteboardSignals,
} from "@/data/mock-workbench"

export default function WhiteboardStudioPage() {
  return (
    <AnimatedPage>
      <PageHeader
        title="Sketch-to-architecture workspace"
        description="Capture early solution ideas, customer-drawn flows, and architecture notes before converting them into structured debate and generator inputs."
      />

      <WhiteboardStudioWorkspace
        aiHook={whiteboardAiHook}
        initialNotes={whiteboardNotes}
        signals={whiteboardSignals}
      />
    </AnimatedPage>
  )
}
