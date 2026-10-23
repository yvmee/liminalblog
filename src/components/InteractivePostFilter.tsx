import { useEffect, useId, useMemo, useRef, useState } from "react"

import { cn } from "../lib/format.ts"
import { spritePaths } from "../lib/pixel.ts"
import type { PostCard as Card } from "../lib/posts.ts"
import { Flame, Lantern } from "./Lantern.tsx"
import { PostCard } from "./PostCard.tsx"

const magnifier = spritePaths([
  "..XXXX....",
  ".X....X...",
  "X......X..",
  "X......X..",
  "X......X..",
  "X......X..",
  ".X....X...",
  "..XXXXXX..",
  "......XXX.",
  ".......XXX",
])

type CategoryTab = { key: string; label: string }

const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

/**
 * Client-side search and category filter for the index. The full grid is
 * server-rendered (all posts visible to crawlers and no-JS readers); filtering
 * only hides cards. State is mirrored to ?q= and ?category= so filtered views
 * can be shared.
 */
export default function InteractivePostFilter({
  posts,
  categories,
}: {
  posts: Card[]
  categories: CategoryTab[]
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const inputRef = useRef<HTMLInputElement>(null)
  const searchId = useId()

  // Restore from the URL after hydration, so the server HTML always matches
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get("q") ?? "")
    const c = params.get("category")
    if (c && categories.some((t) => t.key === c)) setCategory(c)
  }, [categories])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query) params.set("q", query)
    else params.delete("q")
    if (category !== "all") params.set("category", category)
    else params.delete("category")
    const search = params.toString()
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`
    )
  }, [query, category])

  // "/" focuses the search, like most docs sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key !== "/" || target.closest("input, textarea, [contenteditable]"))
        return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", posts.length]])
    for (const p of posts) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [posts])

  const topTags = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of posts)
      for (const t of p.tags) map.set(t, (map.get(t) ?? 0) + 1)
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([tag]) => tag)
  }, [posts])

  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const visible = posts.filter((p) => {
    if (category !== "all" && p.category !== category) return false
    if (!terms.length) return true
    const haystack = normalize(
      [
        p.title,
        p.description,
        p.categoryLabel,
        p.subjectTitle ?? "",
        ...p.tags,
      ].join(" ")
    )
    return terms.every((t) => haystack.includes(t))
  })

  const tabs = [{ key: "all", label: "All" }, ...categories]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {tabs.map((tab) => {
            const active = tab.key === category
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(tab.key)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-sm border-2 px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-lantern bg-lantern/10 text-lantern"
                    : "border-transparent text-muted hover:border-border-strong hover:text-ink"
                )}
              >
                {active && <Flame scale={2} flicker />}
                {tab.label}
                <span className="font-mono text-xs text-faint">
                  {counts.get(tab.key) ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative lg:w-80">
          <label htmlFor={searchId} className="sr-only">
            Search posts by keyword, game or tag
          </label>
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${magnifier.width} ${magnifier.height}`}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 fill-faint"
            shapeRendering="crispEdges"
          >
            <path d={magnifier.paths.X} />
          </svg>
          <input
            ref={inputRef}
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the dark…"
            autoComplete="off"
            className="w-full rounded-sm border-2 border-border-strong bg-void py-2 pr-10 pl-9 text-sm text-ink placeholder:text-faint focus:border-lantern focus:outline-none"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-xs border px-1.5 font-mono text-[0.65rem] text-faint sm:block">
            /
          </kbd>
        </div>
      </div>

      {topTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 eyebrow">Tags</span>
          {topTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(query === tag ? "" : tag)}
              aria-pressed={query === tag}
              className={cn(
                "cursor-pointer rounded-xs px-2 py-0.5 font-mono text-xs transition-colors",
                query === tag
                  ? "bg-lantern text-void"
                  : "bg-raised text-muted hover:text-lantern"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "post" : "posts"} shown
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <li key={post.slug} className="flex">
              <PostCard post={post} className="flex-1" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border-2 border-dashed py-16 text-center">
          <Lantern scale={4} glow className="text-border-strong" />
          <p className="font-serif text-xl text-ink">
            Nothing stirs in this corner yet.
          </p>
          <p className="text-sm text-muted">
            Try another category or a different word.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setCategory("all")
            }}
            className="cursor-pointer text-sm link"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
