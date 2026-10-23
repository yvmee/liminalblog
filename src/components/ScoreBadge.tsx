import { scoreLabel } from "../config/site.ts"
import { cn, formatScore } from "../lib/format.ts"

/** Review score. `sm` sits on cards, `lg` heads the verdict box with a light meter. */
export function ScoreBadge({
  score,
  size = "sm",
  className,
}: {
  score: number
  size?: "sm" | "lg"
  className?: string
}) {
  const label = scoreLabel(score)
  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-baseline gap-1 rounded-sm border-2 border-lantern bg-void/90 px-2 py-0.5 font-mono text-sm font-semibold text-lantern pixel-shadow backdrop-blur",
          className
        )}
        title={`${formatScore(score)} out of 10: ${label}`}
      >
        {formatScore(score)}
        <span className="text-[0.65rem] font-normal text-faint">/10</span>
      </span>
    )
  }
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end gap-3">
        <span className="font-pixel text-7xl leading-none text-lantern [text-shadow:0_0_24px_color-mix(in_oklch,var(--lantern)_45%,transparent)]">
          {formatScore(score)}
        </span>
        <span className="mb-1.5 flex flex-col">
          <span className="font-mono text-xs text-faint">/ 10</span>
          <span className="font-sans text-lg font-semibold tracking-tight text-ink">
            {label}
          </span>
        </span>
      </div>
      {/* Ten cells of light; a half point lights half a cell */}
      <div
        className="flex gap-1"
        role="img"
        aria-label={`Score: ${formatScore(score)} out of 10`}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, score - i))
          return (
            <span
              key={i}
              className="relative h-3 flex-1 overflow-hidden rounded-[2px] bg-raised"
            >
              <span
                className="absolute inset-y-0 left-0 bg-lantern"
                style={{
                  width: `${fill * 100}%`,
                  opacity: 0.55 + (i / 10) * 0.45,
                }}
              />
            </span>
          )
        })}
      </div>
    </div>
  )
}
