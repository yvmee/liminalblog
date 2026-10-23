import rss from "@astrojs/rss"
import type { APIRoute } from "astro"

import { author, categories, scaredyScale, site } from "../config/site.ts"
import { formatScore } from "../lib/format.ts"
import { absoluteUrl } from "../lib/paths.ts"
import { getPosts } from "../lib/posts.ts"

export const GET: APIRoute = async () => {
  const posts = (await getPosts()).filter((p) => !p.data.draft)
  return rss({
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    site: absoluteUrl("/"),
    stylesheet: false,
    trailingSlash: true,
    items: posts.map((post) => {
      const { data } = post
      const r = data.review
      const ratings = [
        r?.score !== undefined && `${formatScore(r.score)}/10`,
        r?.scaredyScore !== undefined &&
          `${scaredyScale.short} ${r.scaredyScore}/10`,
      ].filter(Boolean)
      const score =
        r && ratings.length ? ` [${r.subjectTitle}: ${ratings.join(", ")}]` : ""
      return {
        title: data.title,
        description: `${data.description}${score}`,
        link: absoluteUrl(`/${post.id}/`),
        pubDate: data.pubDate,
        categories: [categories[data.category].label, ...data.tags],
        author: `${author.email} (${author.name})`,
      }
    }),
    customData: `<language>${site.lang}</language><managingEditor>${author.email} (${author.name})</managingEditor><image><url>${absoluteUrl(site.defaultOgImage)}</url><title>${site.name}</title><link>${absoluteUrl("/")}</link></image>`,
  })
}
