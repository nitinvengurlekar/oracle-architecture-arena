import type { WorkbenchTone } from "@/types/workbench"

type ToneClassSet = {
  accent: string
  border: string
  soft: string
  text: string
}

export const toneClasses = {
  blue: {
    accent: "bg-blue-600",
    border: "border-blue-200",
    soft: "bg-blue-50 text-blue-900 ring-blue-200",
    text: "text-blue-700",
  },
  emerald: {
    accent: "bg-emerald-600",
    border: "border-emerald-200",
    soft: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    text: "text-emerald-700",
  },
  amber: {
    accent: "bg-amber-500",
    border: "border-amber-200",
    soft: "bg-amber-50 text-amber-950 ring-amber-200",
    text: "text-amber-700",
  },
  red: {
    accent: "bg-red-600",
    border: "border-red-200",
    soft: "bg-red-50 text-red-950 ring-red-200",
    text: "text-red-700",
  },
  slate: {
    accent: "bg-slate-700",
    border: "border-slate-200",
    soft: "bg-slate-100 text-slate-900 ring-slate-200",
    text: "text-slate-700",
  },
  violet: {
    accent: "bg-violet-600",
    border: "border-violet-200",
    soft: "bg-violet-50 text-violet-950 ring-violet-200",
    text: "text-violet-700",
  },
} satisfies Record<WorkbenchTone, ToneClassSet>

export function getToneClasses(tone: WorkbenchTone) {
  return toneClasses[tone]
}
