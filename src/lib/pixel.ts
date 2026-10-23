/**
 * Tiny pixel-art toolkit, shared with the portfolio (yvmee.github.io).
 * Sprites are rows of characters; each character becomes one crisp SVG path.
 * Deterministic, so server-rendered and hydrated output are identical.
 */

export type Cell = (x: number, y: number) => boolean

/** Merges horizontal runs of filled cells into a compact SVG path. */
export function cellsToPath(width: number, height: number, filled: Cell) {
  let d = ""
  for (let y = 0; y < height; y++) {
    let x = 0
    while (x < width) {
      if (!filled(x, y)) {
        x++
        continue
      }
      const start = x
      while (x < width && filled(x, y)) x++
      d += `M${start} ${y}h${x - start}v1h${start - x}z`
    }
  }
  return d
}

/** Mulberry32: small, fast, seeded PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Draws a sprite from a list of strings; each character maps to a color. "." is transparent. */
export function spritePaths(rows: readonly string[]) {
  const height = rows.length
  const width = Math.max(...rows.map((r) => r.length))
  const colors = new Set(rows.join("").replaceAll(".", ""))
  const paths: Record<string, string> = {}
  for (const color of colors) {
    paths[color] = cellsToPath(width, height, (x, y) => rows[y][x] === color)
  }
  return { paths, width, height }
}

/** String hash, used to seed procedural art from a slug. */
export function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
