/**
 * Base-path aware URL helpers. Author everything relative to the site root
 * ("/press/", "/images/posts/x/cover.png") and these add "/blog" for you, in
 * dev and in production. Paths that already carry the base, external URLs,
 * protocol links (mailto:, tel:) and hash/query-only links pass through.
 */
import { BASE_PATH, SITE_URL } from "../config/site.ts"

const base = BASE_PATH.replace(/\/+$/, "")

const isExternal = (path: string) =>
  /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")

/** Pages get a trailing slash (GitHub Pages serves folders/index.html). */
function withTrailingSlash(path: string) {
  const [pathname, rest = ""] = path.split(/(?=[?#])/, 2)
  const last = pathname.split("/").pop() ?? ""
  if (pathname.endsWith("/") || last.includes(".")) return path
  return `${pathname}/${rest}`
}

/** Adds the base path to a root-relative path. Idempotent. */
export function withBase(path: string) {
  if (!path || isExternal(path) || path.startsWith("#") || path.startsWith("?"))
    return path
  const clean = path.startsWith("/") ? path : `/${path}`
  if (clean === base || clean.startsWith(`${base}/`)) return clean
  return `${base}${clean}`
}

/** Internal page link: base path plus trailing slash. `href("/")` is the blog index. */
export function href(path = "/") {
  if (isExternal(path)) return path
  return withTrailingSlash(withBase(path))
}

/** Static asset in public/ (images, feeds). No trailing slash is added. */
export function asset(path: string) {
  return withBase(path)
}

/** Absolute URL for canonical links, OpenGraph, JSON-LD, RSS and the sitemap. */
export function absoluteUrl(path = "/") {
  if (isExternal(path)) return path
  return new URL(href(path), SITE_URL).toString()
}

export const postHref = (slug: string) => href(`/${slug}/`)
export const categoryHref = (category: string) => href(`/category/${category}/`)
