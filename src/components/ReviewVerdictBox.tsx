import type { ReactNode } from "react"

import { cn } from "../lib/format.ts"
import { Flame, Lantern } from "./Lantern.tsx"
import { ScaredyBadge } from "./ScaredyBadge.tsx"
import { ScoreBadge } from "./ScoreBadge.tsx"

export type Review = {
  subjectTitle: string
  creator: string
  publisher?: string
  releaseYear: number
  platforms?: string[]
  horrorSubgenre: string
  score?: number
  scaredyScore?: number
  verdict: string
  pros: string[]
  cons: string[]
  disclosure?: string
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  )
}

/**
 * Score, metadata, pros/cons, verdict and disclosure. Rendered automatically
 * at the end of any post with `review` frontmatter (see PostLayout).
 */
export function ReviewVerdictBox({
  review,
  creatorLabel = "Developer",
  rubricHref,
  className,
}: {
  review: Review
  /** "Developer" for games, "Director" for films */
  creatorLabel?: string
  /** Link to the scoring rubric on the press page */
  rubricHref?: string
  className?: string
}) {
  return (
    <section
      id="verdict"
      aria-labelledby="verdict-title"
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-md border-2 border-lantern/60 bg-surface font-sans glow-lantern",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b-2 border-lantern/40 bg-raised px-4 py-2">
        <h2
          id="verdict-title"
          className="font-mono text-sm tracking-[0.18em] text-ink uppercase"
        >
          Verdict · {review.subjectTitle}
        </h2>
        <Lantern scale={1.5} className="text-void" />
      </div>

      <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-[minmax(0,15rem)_1fr]">
        <div className="flex flex-col gap-6">
          {review.score !== undefined && (
            <ScoreBadge score={review.score} size="lg" />
          )}
          {review.scaredyScore !== undefined && (
            <ScaredyBadge score={review.scaredyScore} size="lg" />
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-1">
            <Meta label={creatorLabel}>{review.creator}</Meta>
            {review.publisher && (
              <Meta label="Publisher">{review.publisher}</Meta>
            )}
            <Meta label="Released">{review.releaseYear}</Meta>
            <Meta label="Subgenre">{review.horrorSubgenre}</Meta>
            {review.platforms?.length ? (
              <Meta label="Platforms">{review.platforms.join(", ")}</Meta>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-col gap-7">
          <blockquote className="border-l-2 border-lantern pl-5 font-serif text-xl leading-relaxed text-ink italic sm:text-2xl">
            {review.verdict}
          </blockquote>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-mist uppercase">
                <span aria-hidden="true" className="text-base leading-none">
                  +
                </span>
                What lingers
              </h3>
              <ul className="space-y-2.5">
                {review.pros.map((pro) => (
                  <li
                    key={pro}
                    className="flex gap-2.5 text-[0.95rem] leading-snug text-muted"
                  >
                    <Flame scale={1.5} className="mt-1" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-blood uppercase">
                <span aria-hidden="true" className="text-base leading-none">
                  −
                </span>
                What falters
              </h3>
              <ul className="space-y-2.5">
                {review.cons.map((con) => (
                  <li
                    key={con}
                    className="flex gap-2.5 text-[0.95rem] leading-snug text-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 bg-blood"
                    />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-1 border-t-2 border-border bg-void/60 px-5 py-3 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-mono tracking-wider text-muted uppercase">
            Disclosure:{" "}
          </span>
          {review.disclosure ?? "No disclosure provided."}
        </p>
        {rubricHref && (
          <a href={rubricHref} className="shrink-0 link">
            How we score
          </a>
        )}
      </footer>
    </section>
  )
}

export default ReviewVerdictBox
