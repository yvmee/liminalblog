/**
 * Procedural pixel art as SVG strings: the favicon, placeholder post covers
 * and the default social card. Pure functions with no Astro imports, so the
 * Node scripts in scripts/ can rasterize them with sharp.
 */
import { cellsToPath, hash, rng, spritePaths } from "./pixel.ts"
import { lanternPalette, lanternRows } from "./sprites.ts"

/** Hex approximations of the CSS tokens in global.css (for raster output). */
export const colors = {
  void: "#0b1114",
  background: "#11191d",
  surface: "#172126",
  border: "#2d3a3f",
  borderStrong: "#4a5a60",
  ink: "#e2efec",
  muted: "#b3c2c2",
  mist: "#8fd6c3",
  lantern: "#f0946c",
  flame: "#fde8c4",
  blood: "#e5605a",
  violet: "#a99cf2",
}

const lantern = spritePaths(lanternRows)

function lanternGroup(
  x: number,
  y: number,
  scale: number,
  frame: string = lanternPalette.X
) {
  const fills: Record<string, string> = { ...lanternPalette, X: frame }
  return `<g transform="translate(${x} ${y}) scale(${scale})" shape-rendering="crispEdges">${Object.entries(
    lantern.paths
  )
    .map(([key, d]) => `<path d="${d}" fill="${fills[key]}"/>`)
    .join("")}</g>`
}

/** Square lantern icon (favicon / app icons). */
export function lanternSvg({
  padding = 2,
  background,
  rounded = false,
}: { padding?: number; background?: string; rounded?: boolean } = {}) {
  const size = Math.max(lantern.width, lantern.height) + padding * 2
  const x = (size - lantern.width) / 2
  const y = (size - lantern.height) / 2
  const bg = background
    ? `<rect width="${size}" height="${size}" rx="${rounded ? size * 0.18 : 0}" fill="${background}"/>
       <circle cx="${size / 2}" cy="${y + 12}" r="${size * 0.42}" fill="url(#g)"/>`
    : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs><radialGradient id="g"><stop offset="0" stop-color="${colors.lantern}" stop-opacity=".45"/><stop offset="1" stop-color="${colors.lantern}" stop-opacity="0"/></radialGradient></defs>
  ${bg}${lanternGroup(x, y, 1, colors.borderStrong)}
</svg>`
}

/* ---------- 5x7 pixel font (uppercase, digits, basic punctuation) ---------- */

const glyphs: Record<string, string[]> = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  B: ["XXXX.", "X...X", "X...X", "XXXX.", "X...X", "X...X", "XXXX."],
  C: [".XXX.", "X...X", "X....", "X....", "X....", "X...X", ".XXX."],
  D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
  E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
  F: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "X...."],
  G: [".XXX.", "X...X", "X....", "X.XXX", "X...X", "X...X", ".XXXX"],
  H: ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  I: [".XXX.", "..X..", "..X..", "..X..", "..X..", "..X..", ".XXX."],
  J: ["..XXX", "...X.", "...X.", "...X.", "...X.", "X..X.", ".XX.."],
  K: ["X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"],
  L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X.X.X", "X...X", "X...X", "X...X"],
  N: ["X...X", "X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  Q: [".XXX.", "X...X", "X...X", "X...X", "X.X.X", "X..X.", ".XX.X"],
  R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  U: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  V: ["X...X", "X...X", "X...X", "X...X", "X...X", ".X.X.", "..X.."],
  W: ["X...X", "X...X", "X...X", "X.X.X", "X.X.X", "X.X.X", ".X.X."],
  X: ["X...X", "X...X", ".X.X.", "..X..", ".X.X.", "X...X", "X...X"],
  Y: ["X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
  Z: ["XXXXX", "....X", "...X.", "..X..", ".X...", "X....", "XXXXX"],
  "0": [".XXX.", "X...X", "X..XX", "X.X.X", "XX..X", "X...X", ".XXX."],
  "1": ["..X..", ".XX..", "..X..", "..X..", "..X..", "..X..", ".XXX."],
  "2": [".XXX.", "X...X", "....X", "...X.", "..X..", ".X...", "XXXXX"],
  "3": ["XXXX.", "....X", "....X", ".XXX.", "....X", "....X", "XXXX."],
  "4": ["...X.", "..XX.", ".X.X.", "X..X.", "XXXXX", "...X.", "...X."],
  "5": ["XXXXX", "X....", "XXXX.", "....X", "....X", "X...X", ".XXX."],
  "6": [".XXX.", "X....", "X....", "XXXX.", "X...X", "X...X", ".XXX."],
  "7": ["XXXXX", "....X", "...X.", "..X..", ".X...", ".X...", ".X..."],
  "8": [".XXX.", "X...X", "X...X", ".XXX.", "X...X", "X...X", ".XXX."],
  "9": [".XXX.", "X...X", "X...X", ".XXXX", "....X", "....X", ".XXX."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..X.."],
  ",": [".....", ".....", ".....", ".....", ".....", "..X..", ".X..."],
  ":": [".....", "..X..", ".....", ".....", ".....", "..X..", "....."],
  "'": ["..X..", "..X..", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", ".XXX.", ".....", ".....", "....."],
  "/": ["....X", "...X.", "...X.", "..X..", ".X...", ".X...", "X...."],
  "?": [".XXX.", "X...X", "....X", "...X.", "..X..", ".....", "..X.."],
  "!": ["..X..", "..X..", "..X..", "..X..", "..X..", ".....", "..X.."],
  "&": [".XX..", "X..X.", "X.X..", ".X...", "X.X.X", "X..X.", ".XX.X"],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
}

/** Uppercases and strips characters the font can't draw. */
export const pixelFontText = (text: string) =>
  text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .split("")
    .filter((c) => c in glyphs)
    .join("")

/** One line of pixel text as a path in font-cell units (6 cells per char). */
export function pixelTextPath(text: string) {
  const chars = pixelFontText(text)
  const width = chars.length * 6
  const path = cellsToPath(width, 7, (x, y) => {
    if (x % 6 === 5) return false
    return glyphs[chars[Math.floor(x / 6)]][y][x % 6] === "X"
  })
  return { path, width: Math.max(0, width - 1), height: 7 }
}

/** Greedy word wrap to `max` characters per line. */
export function wrap(text: string, max: number, maxLines = 3) {
  const lines: string[] = []
  for (const word of pixelFontText(text).split(" ")) {
    const last = lines.at(-1)
    if (last !== undefined && (last + " " + word).length <= max)
      lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] =
      lines[maxLines - 1].slice(0, max - 3).trimEnd() + "..."
  }
  return lines
}

function textBlock(
  lines: string[],
  x: number,
  y: number,
  scale: number,
  fill: string,
  shadow = colors.void
) {
  return lines
    .map((line, i) => {
      const { path } = pixelTextPath(line)
      const ty = y + i * 10 * scale
      return `<path transform="translate(${x + scale} ${ty + scale}) scale(${scale})" d="${path}" fill="${shadow}"/>
      <path transform="translate(${x} ${ty}) scale(${scale})" d="${path}" fill="${fill}"/>`
    })
    .join("")
}

/* ---------------------------- Scenes ---------------------------- */

/** Midpoint-displacement ridge line (from the portfolio), one height per column. */
function ridge(seed: number, width: number, roughness = 0.55) {
  const random = rng(seed)
  let size = 1
  while (size < width) size *= 2
  const heights = new Array<number>(size + 1).fill(0)
  heights[0] = random()
  heights[size] = random()
  let step = size
  let scale = 1
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < size; i += step) {
      heights[i] =
        (heights[i - half] + heights[i + half]) / 2 + (random() - 0.5) * scale
    }
    step = half
    scale *= roughness
  }
  const slice = heights.slice(0, width)
  const min = Math.min(...slice)
  const max = Math.max(...slice)
  return slice.map((h) => (h - min) / (max - min || 1))
}

/** Dead treeline silhouette: a ground ridge with spiky trunks and branches. */
function treeline(seed: number, width: number, height: number, base: number) {
  const random = rng(seed)
  const ground = ridge(seed, width, 0.5).map((h) => Math.round(base + h * 4))
  const filled = new Set<number>()
  const set = (x: number, y: number) => {
    if (x >= 0 && x < width && y >= 0 && y < height) filled.add(y * width + x)
  }
  for (let x = 0; x < width; x++)
    for (let y = ground[x]; y < height; y++) set(x, y)
  let x = Math.floor(random() * 6)
  while (x < width) {
    const h = 10 + Math.floor(random() * 26)
    const top = ground[x] - h
    for (let y = top; y < ground[x]; y++) {
      set(x, y)
      if (y > top + h * 0.6) set(x + 1, y)
    }
    // branches
    for (let b = 0; b < 3 + random() * 4; b++) {
      const by = top + 2 + Math.floor(random() * h * 0.6)
      const dir = random() < 0.5 ? -1 : 1
      const len = 2 + Math.floor(random() * 5)
      for (let i = 1; i <= len; i++) set(x + dir * i, by - Math.floor(i / 2))
    }
    x += 4 + Math.floor(random() * 14)
  }
  return cellsToPath(width, height, (cx, cy) => filled.has(cy * width + cx))
}

/** Drifting fog: horizontal streaks, denser toward the ground. */
function fog(seed: number, width: number, top: number, bottom: number) {
  const random = rng(seed)
  let d = ""
  for (let y = top; y < bottom; y += 2) {
    const density = (y - top) / (bottom - top)
    let x = Math.floor(random() * 8)
    while (x < width) {
      const length = 3 + Math.floor(random() * (6 + density * 30))
      if (random() < 0.15 + density * 0.6)
        d += `M${x} ${y}h${length}v1h${-length}z`
      x += length + 2 + Math.floor(random() * 14 * (1 - density))
    }
  }
  return d
}

const tints: Record<string, string> = {
  "horror-games": colors.lantern,
  "horror-movies": colors.blood,
  "ludology-research": colors.mist,
  "event-coverage": colors.violet,
}

/**
 * 1200x630 placeholder cover: dead trees, fog, and a lantern whose light is
 * tinted by category. Deterministic per seed text (the slug).
 */
export function coverSvg({
  seed: seedText,
  category = "horror-games",
  label,
  showLantern = true,
}: {
  seed: string
  category?: string
  showLantern?: boolean
  /** Optional big pixel-font label (e.g. the game's title) */
  label?: string
}) {
  const seed = hash(seedText)
  const random = rng(seed)
  const tint = tints[category] ?? colors.lantern
  const W = 240
  const H = 126
  const S = 5
  const lx = Math.round(W * (0.62 + random() * 0.22))
  const ly = 72 + Math.floor(random() * 10)

  const farRidge = ridge(seed + 3, W, 0.6)
  const far = cellsToPath(
    W,
    H,
    (x, y) => y >= 66 + Math.round(farRidge[x] * 18)
  )
  const lines = label ? wrap(label, 22, 3) : []

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${colors.void}"/>
      <stop offset=".7" stop-color="${colors.surface}"/>
      <stop offset="1" stop-color="${colors.background}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${(lx + 6.5) / W}" cy="${(ly + 11) / H}" r=".55" gradientTransform="translate(${(lx + 6.5) / W} ${(ly + 11) / H}) scale(1 1.9) translate(${-(lx + 6.5) / W} ${-(ly + 11) / H})">
      <stop offset="0" stop-color="${tint}" stop-opacity=".55"/>
      <stop offset=".25" stop-color="${tint}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".5" r=".75">
      <stop offset=".55" stop-color="${colors.void}" stop-opacity="0"/>
      <stop offset="1" stop-color="${colors.void}" stop-opacity=".9"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="scale(${S})" shape-rendering="crispEdges">
    <path d="${far}" fill="${colors.border}" opacity=".55"/>
    <path d="${fog(seed + 7, W, 60, 104)}" fill="${colors.muted}" opacity=".07"/>
    <path d="${treeline(seed + 11, W, H, 96)}" fill="${colors.void}" opacity=".85"/>
    <path d="${fog(seed + 13, W, 88, 118)}" fill="${colors.muted}" opacity=".09"/>
    ${showLantern ? lanternGroup(lx, ly, 1) : ""}
    <path d="${treeline(seed + 17, W, H, 112)}" fill="${colors.void}"/>
  </g>
  <rect width="1200" height="630" fill="url(#vignette)"/>
  ${textBlock(lines, 60, 630 - 60 - (lines.length * 10 - 3) * 6, 6, colors.ink)}
</svg>`
}

/** Default 1200x630 social card with the wordmark. */
export function ogSvg({
  name,
  tagline,
  url,
}: {
  name: string
  tagline: string
  url: string
}) {
  const scene = coverSvg({ seed: "liminal-og", showLantern: false })
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${scene}
  <defs>
    <radialGradient id="halo"><stop offset="0" stop-color="${colors.lantern}" stop-opacity=".5"/><stop offset=".3" stop-color="${colors.lantern}" stop-opacity=".14"/><stop offset="1" stop-color="${colors.lantern}" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="230" cy="330" r="300" fill="url(#halo)"/>
  ${lanternGroup(165, 170, 10)}
  ${textBlock([name], 420, 220, 16, colors.ink)}
  ${textBlock([tagline], 424, 360, 4, colors.lantern)}
  ${textBlock([url], 424, 420, 3, colors.muted)}
</svg>`
}
