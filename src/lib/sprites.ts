/**
 * Pixel sprites as rows of characters. "." is transparent. Shared with the
 * Node scripts that render the favicon, covers and social card.
 *
 * Lantern: X frame (silhouette), G glass glow, F flame, Y flame core.
 */
export const lanternRows = [
  "....XXXXX....",
  "...X.....X...",
  "....XXXXX....",
  "......X......",
  "..XXXXXXXXX..",
  ".XXXXXXXXXXX.",
  "..XGGGGGGGX..",
  "..XGGGGGGGX..",
  "..XGGGFGGGX..",
  "..XGGFFGGGX..",
  "..XGGFFFGGX..",
  "..XGFFYFFGX..",
  "..XGFYYYFGX..",
  "..XGFYYYFGX..",
  "..XGGFYFGGX..",
  "..XGGGXGGGX..",
  "..XGGGXGGGX..",
  ".XXXXXXXXXXX.",
  "..XXXXXXXXX..",
  "...X.....X...",
] as const

/** A single flame, used as bullet / marker. */
export const flameRows = [
  "..F..",
  ".FF..",
  ".FFF.",
  "FFYFF",
  "FYYYF",
  ".FYF.",
] as const

/** Fixed colors for raster output (favicon, covers, social card). */
export const lanternPalette = {
  X: "#0b1114",
  G: "#5a3428",
  F: "#f0946c",
  Y: "#fde8c4",
} as const
