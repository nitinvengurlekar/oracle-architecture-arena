import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
            {eyebrow}
          </div>
        ) : null}
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl",
            eyebrow ? "mt-2" : ""
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </section>
  )
}
