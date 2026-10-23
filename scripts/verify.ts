/**
 * Post-build checks on dist/ (run after `astro build`, also in CI):
 *  - every internal href/src resolves to a file, and carries the base path
 *  - every page has a canonical URL and parseable JSON-LD
 *  - rss.xml and the sitemap exist and point at the right origin
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

import { BASE_PATH, SITE_URL } from "../src/config/site.ts"

const dist = join(dirname(fileURLToPath(import.meta.url)), "../dist")
const base = BASE_PATH.replace(/\/$/, "")
const errors: string[] = []

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

/** Maps a URL path under the base to a file in dist/. */
function resolves(pathname: string) {
  const local = decodeURIComponent(pathname.slice(base.length)) || "/"
  const file = join(dist, local)
  return local.endsWith("/")
    ? existsSync(join(file, "index.html"))
    : existsSync(file)
}

const pages = walk(dist).filter((f) => f.endsWith(".html"))
for (const page of pages) {
  const name = relative(dist, page)
  const html = readFileSync(page, "utf8")

  for (const [, attr, value] of html.matchAll(
    /\s(href|src|srcset|content)="([^"]+)"/g
  )) {
    let url: URL
    try {
      url = new URL(value.split(/\s/)[0], `${SITE_URL}${base}/${name}`)
    } catch {
      continue
    }
    if (
      url.origin !== SITE_URL ||
      (attr === "content" && !value.startsWith(SITE_URL))
    )
      continue
    if (!url.pathname.startsWith(`${base}/`) && url.pathname !== base) {
      // Links to the portfolio at the domain root are expected
      if (url.pathname === "/") continue
      errors.push(`${name}: ${value} is missing the ${base} base path`)
    } else if (!resolves(url.pathname)) {
      errors.push(`${name}: ${value} does not resolve to a file in dist/`)
    }
  }

  if (!html.includes("noindex") && !/<link rel="canonical"/.test(html))
    errors.push(`${name}: no canonical link`)
  for (const [, json] of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  )) {
    try {
      JSON.parse(json)
    } catch {
      errors.push(`${name}: invalid JSON-LD`)
    }
  }
}

for (const file of [
  "rss.xml",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "robots.txt",
  ".nojekyll",
]) {
  if (!existsSync(join(dist, file))) errors.push(`missing dist/${file}`)
}
const rss = existsSync(join(dist, "rss.xml"))
  ? readFileSync(join(dist, "rss.xml"), "utf8")
  : ""
if (!rss.includes(`${SITE_URL}${base}/`))
  errors.push("rss.xml links do not use the full base URL")

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ${errors.join("\n  ")}`)
  process.exit(1)
}
console.log(
  `✓ ${pages.length} pages checked: links, base path, canonicals, JSON-LD, feeds`
)
