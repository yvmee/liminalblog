import type { CSSProperties } from "react"

import { cn } from "../lib/format.ts"
import { spritePaths } from "../lib/pixel.ts"
import { flameRows, lanternRows } from "../lib/sprites.ts"

const lantern = spritePaths(lanternRows)
const flame = spritePaths(flameRows)

/**
 * The publication's mark: a pixel-art lantern. The frame is `currentColor`,
 * so set its silhouette color with a text-* class. `glow` adds a light pool
 * behind it, `flicker` animates the flame, `sway` swings it from the ring.
 */
export function Lantern({
  scale = 3,
  glow = false,
  flicker = true,
  sway = false,
  className,
  style,
}: {
  /** Size of one art pixel in CSS pixels. Omit (0) for fluid sizing via className. */
  scale?: number
  glow?: boolean
  flicker?: boolean
  sway?: boolean
  className?: string
  style?: CSSProperties
}) {
  const size = scale
    ? { width: lantern.width * scale, height: lantern.height * scale }
    : {}
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative isolate inline-block shrink-0 origin-top",
        sway && "animate-sway",
        className
      )}
      style={{ ...size, ...style }}
    >
      {glow && (
        <span
          className={cn(
            "pointer-events-none absolute top-[60%] left-1/2 -z-10 size-[420%] -translate-1/2 rounded-full",
            flicker && "animate-flicker"
          )}
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklch, var(--lantern) 32%, transparent) 0%, color-mix(in oklch, var(--lantern) 9%, transparent) 45%, transparent 100%)",
          }}
        />
      )}
      <svg
        viewBox={`0 0 ${lantern.width} ${lantern.height}`}
        shapeRendering="crispEdges"
        focusable="false"
        className="block size-full"
      >
        <path d={lantern.paths.X} fill="currentColor" />
        <path d={lantern.paths.G} fill="var(--glass)" />
        <g className={cn(flicker && "animate-flicker")}>
          <path d={lantern.paths.F} fill="var(--lantern)" />
          <path d={lantern.paths.Y} fill="var(--flame)" />
        </g>
      </svg>
    </span>
  )
}

/** A single pixel flame: bullets, markers, active states. */
export function Flame({
  scale = 2,
  flicker = false,
  className,
}: {
  scale?: number
  flicker?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${flame.width} ${flame.height}`}
      width={flame.width * scale}
      height={flame.height * scale}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "inline-block shrink-0",
        flicker && "animate-flicker",
        className
      )}
    >
      <path d={flame.paths.F} fill="var(--lantern)" />
      <path d={flame.paths.Y} fill="var(--flame)" />
    </svg>
  )
}
