import { cn, formatDate } from "../lib/format.ts"
import type { PostCard as Card } from "../lib/posts.ts"
import { CategoryBadge } from "./CategoryBadge.tsx"
import { ScaredyBadge } from "./ScaredyBadge.tsx"
import { ScoreBadge } from "./ScoreBadge.tsx"

/**
 * Grid card. Covers sit in the dark (desaturated) and warm up under the
 * cursor, as if a lantern passed over them.
 */
export function PostCard({
  post,
  headingLevel = 3,
  eager = false,
  className,
}: {
  post: Card
  headingLevel?: 2 | 3
  eager?: boolean
  className?: string
}) {
  const Heading = `h${headingLevel}` as const
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border-2 bg-surface pixel-shadow transition-[border-color,box-shadow,translate] duration-300 focus-within:border-lantern/70 hover:-translate-y-0.5 hover:border-lantern/70 hover:glow-lantern",
        className
      )}
    >
      <div className="relative aspect-[1200/630] overflow-hidden border-b-2 bg-void">
        <img
          src={post.coverImage}
          alt={post.coverImageAlt}
          width={1200}
          height={630}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-cover brightness-75 grayscale-[65%] transition duration-500 group-hover:scale-[1.03] group-hover:brightness-100 group-hover:grayscale-0"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <CategoryBadge category={post.category} label={post.categoryLabel} />
          <div className="flex flex-col items-end gap-1.5">
            {post.score !== undefined && <ScoreBadge score={post.score} />}
            {post.scaredyScore !== undefined && (
              <ScaredyBadge score={post.scaredyScore} />
            )}
          </div>
        </div>
        {post.draft && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-blood px-2 py-0.5 font-mono text-xs text-void">
            DRAFT
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Heading className="text-lg leading-snug font-semibold tracking-tight text-balance text-ink">
          {/* Stretched link: the whole card is clickable, the title is the accessible name */}
          <a
            href={post.url}
            className="outline-none group-hover:text-lantern after:absolute after:inset-0 after:content-[''] focus-visible:text-lantern"
          >
            {post.title}
          </a>
        </Heading>
        <p className="line-clamp-3 font-serif text-[1.02rem] leading-relaxed text-muted">
          {post.description}
        </p>
        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-2 font-mono text-xs text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} min read</span>
        </p>
      </div>
    </article>
  )
}
