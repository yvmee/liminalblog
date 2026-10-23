import type { CategoryKey } from "../config/site.ts"
import { cn } from "../lib/format.ts"

const tone: Partial<Record<CategoryKey, string>> = {
  "horror-games": "text-lantern border-lantern/50",
  "ludology-research": "text-mist border-mist/50",
  "event-coverage": "text-violet border-violet/50",
}

export function CategoryBadge({
  category,
  label,
  className,
}: {
  category: CategoryKey
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border bg-void/80 px-2 py-0.5 font-mono text-[0.68rem] tracking-[0.14em] uppercase backdrop-blur",
        tone[category] ?? "border-border-strong text-muted",
        className
      )}
    >
      {label}
    </span>
  )
}
