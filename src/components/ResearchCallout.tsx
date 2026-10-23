import type { ReactNode } from "react"

import { cn } from "../lib/format.ts"

const kinds = {
  research: {
    label: "Research Note",
    border: "border-mist/60",
    text: "text-mist",
  },
  mechanics: {
    label: "Mechanics Breakdown",
    border: "border-lantern/60",
    text: "text-lantern",
  },
  design: {
    label: "Dev Insight",
    border: "border-violet/60",
    text: "text-violet",
  },
  sound: { label: "Sound Design", border: "border-mist/60", text: "text-mist" },
} as const

type Kind = keyof typeof kinds

/**
 * Callout for game dev and research insights (AI director logic, sound,
 * pacing...). Usable in MDX without an import: <ResearchCallout title="...">.
 */
export function ResearchCallout({
  kind = "research",
  title,
  source,
  children,
}: {
  kind?: Kind
  title?: string
  /** Optional citation shown under the body, e.g. "Perron (2009), p. 12" */
  source?: ReactNode
  children: ReactNode
}) {
  const { label, border, text } = kinds[kind]
  return (
    <aside
      className={cn(
        "my-10 rounded-md border-2 bg-surface font-sans pixel-shadow",
        border
      )}
    >
      <div
        className={cn("flex items-center gap-3 border-b-2 px-4 py-2", border)}
      >
        <span
          className={cn(
            "font-mono text-[0.7rem] tracking-[0.18em] uppercase",
            text
          )}
        >
          {label}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-2 rounded-full border-2 border-border-strong" />
          <span className="size-2 rounded-full border-2 border-border-strong" />
        </span>
      </div>
      <div className="flex flex-col gap-3 px-5 py-4 text-[0.98rem] leading-relaxed text-muted [&_a]:link [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&>p+p]:mt-0">
        {title && <p className="text-base font-semibold text-ink">{title}</p>}
        {children}
        {source && (
          <p className="font-mono text-xs text-faint">Source: {source}</p>
        )}
      </div>
    </aside>
  )
}

/** Alias with the mechanics styling: <MechanicsBreakdown title="Enemy AI"> */
export function MechanicsBreakdown(
  props: Omit<Parameters<typeof ResearchCallout>[0], "kind">
) {
  return <ResearchCallout kind="mechanics" {...props} />
}
