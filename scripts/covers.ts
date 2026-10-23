/**
 * Renders the raster art into public/:
 *  - og-default.png (1200x630 social card), favicon-32.png, apple-touch-icon.png
 *  - a placeholder cover for every post whose `coverImage` file is missing
 *
 * Run with `npm run covers` (Node >= 24 runs TypeScript directly).
 * Pass --force to regenerate covers that already exist.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

import { BASE_PATH, SITE_URL, site } from "../src/config/site.ts"
import { coverSvg, lanternSvg, ogSvg } from "../src/lib/art.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = join(root, "public")
const postsDir = join(root, "src/content/posts")

async function png(svg: string, file: string, size?: number) {
  mkdirSync(dirname(file), { recursive: true })
  // Square icons only have a viewBox; give them an explicit pixel size
  const sized = size
    ? svg.replace("<svg ", `<svg width="${size}" height="${size}" `)
    : svg
  await sharp(Buffer.from(sized)).png({ compressionLevel: 9 }).toFile(file)
}

/** Writes a placeholder cover. Used by this script and by new-post. */
export async function writeCover(
  file: string,
  options: { seed: string; category?: string; label?: string }
) {
  await png(coverSvg(options), file)
}

/** Reads one top-level (or review.*) scalar from YAML frontmatter. */
function frontmatterValue(source: string, key: string, indent = "") {
  const match = source.match(
    new RegExp(`^${indent}${key}:\\s*["']?(.+?)["']?\\s*$`, "m")
  )
  return match?.[1]
}

async function main() {
  const force = process.argv.includes("--force")
  const host = new URL(SITE_URL).host

  await png(
    ogSvg({
      name: site.name,
      tagline: site.tagline,
      url: `${host}${BASE_PATH}`,
    }),
    join(publicDir, "og-default.png")
  )
  await png(
    lanternSvg({ background: "#0b1114", rounded: true }),
    join(publicDir, "favicon-32.png"),
    32
  )
  await png(
    lanternSvg({ background: "#0b1114" }),
    join(publicDir, "apple-touch-icon.png"),
    180
  )
  console.log("✓ og-default.png, favicon-32.png, apple-touch-icon.png")

  for (const name of readdirSync(postsDir).filter((f) => /\.mdx?$/.test(f))) {
    const source =
      readFileSync(join(postsDir, name), "utf8").split(/^---$/m)[1] ?? ""
    const cover = frontmatterValue(source, "coverImage")
    if (!cover || /^https?:/.test(cover)) continue
    const file = join(publicDir, cover)
    if (existsSync(file) && !force) continue
    await writeCover(file, {
      seed: name.replace(/\.mdx?$/, ""),
      category: frontmatterValue(source, "category"),
      label:
        frontmatterValue(source, "subjectTitle", "\\s+") ??
        frontmatterValue(source, "title"),
    })
    console.log(`✓ ${cover}`)
  }
}

if (import.meta.main) await main()
