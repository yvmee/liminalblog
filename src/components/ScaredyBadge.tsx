import { scaredyLabel, scaredyScale } from "../config/site.ts"
import { cn } from "../lib/format.ts"
import { spritePaths } from "../lib/pixel.ts"

const cat = spritePaths([
  "X.....X",
  "XX...XX",
  "XXXXXXX",
  "X.XXX.X",
  "XXXXXXX",
  ".XXXXX.",
])

function CatIcon({
  scale = 2,
  className,
}: {
  scale?: number
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${cat.width} ${cat.height}`}
      width={cat.width * scale}
      height={cat.height * scale}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={cn("inline-block shrink-0 fill-current", className)}
    >
      <path d={cat.paths.X} />
    </svg>
  )
}

/**
 * Scaredy-Cat Scale: how playable a game is for people who scare easily.
 * 1 = do not play, 10 = not scary at all. `sm` for cards, `lg` for the verdict box.
 */
export function ScaredyBadge({
  score,
  size = "sm",
  className,
}: {
  score: number
  size?: "sm" | "lg"
  className?: string
}) {
  const label = scaredyLabel(score)
  const band = scaredyScale.bands.find((b) => score >= b.min)
  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border-2 border-mist/70 bg-void/90 px-2 py-0.5 font-mono text-sm font-semibold text-mist pixel-shadow backdrop-blur",
          className
        )}
        title={`${scaredyScale.name}: ${score}/10, ${label} (higher is less scary)`}
      >
        <CatIcon scale={1.5} />
        {score}
        <span className="text-[0.65rem] font-normal text-faint">/10</span>
      </span>
    )
  }
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="flex items-center gap-2 eyebrow text-mist">
        <CatIcon scale={1.5} /> {scaredyScale.name}
      </p>
      <div className="flex items-end gap-3">
        <span className="font-pixel text-5xl leading-none text-mist">
          {score}
        </span>
        <span className="mb-1 flex flex-col">
          <span className="font-mono text-xs text-faint">/ 10</span>
          <span className="font-sans text-base font-semibold tracking-tight text-ink">
            {label}
          </span>
        </span>
      </div>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${scaredyScale.name}: ${score} out of 10, ${label}. Higher means less scary.`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-[2px]",
              i < score ? "bg-mist" : "bg-raised"
            )}
          />
        ))}
      </div>
      <p className="flex justify-between font-mono text-[0.65rem] text-faint">
        <span>Too scary</span>
        <span>Not scary</span>
      </p>
      {band && <p className="text-xs leading-snug text-muted">{band.text}</p>}
    </div>
  )
}
