import { getCollection, type CollectionEntry } from "astro:content"

import { categories, type CategoryKey } from "../config/site.ts"
import { asset, postHref } from "./paths.ts"

export type Post = CollectionEntry<"posts">

/** Published posts, newest first. Drafts show up in `astro dev` only. */
export async function getPosts() {
  const posts = await getCollection(
    "posts",
    ({ data }) => import.meta.env.DEV || !data.draft
  )
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

/** Reading time in minutes at ~230 wpm, ignoring code, JSX tags and frontmatter. */
export function readingTime(body = "") {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^(import|export)\s.*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`[\]()!-]/g, " ")
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 230))
}

/** Ranks other posts by shared tags, then same category, then recency. */
export function relatedPosts(post: Post, all: Post[], limit = 3) {
  const tags = new Set(post.data.tags.map((t) => t.toLowerCase()))
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      score:
        p.data.tags.filter((t) => tags.has(t.toLowerCase())).length * 2 +
        (p.data.category === post.data.category ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf()
    )
    .slice(0, limit)
    .map(({ post }) => post)
}

export const categoryLabel = (key: CategoryKey) => categories[key].label

/** Serializable card data shared by Astro pages and the React filter island. */
export type PostCard = {
  slug: string
  url: string
  title: string
  description: string
  category: CategoryKey
  categoryLabel: string
  tags: string[]
  date: string
  readingTime: number
  coverImage: string
  coverImageAlt: string
  score?: number
  scaredyScore?: number
  subjectTitle?: string
  draft: boolean
}

export function toCard(post: Post): PostCard {
  const { data } = post
  return {
    slug: post.id,
    url: postHref(post.id),
    title: data.title,
    description: data.description,
    category: data.category,
    categoryLabel: categoryLabel(data.category),
    tags: data.tags,
    date: data.pubDate.toISOString(),
    readingTime: readingTime(post.body),
    coverImage: asset(data.coverImage),
    coverImageAlt: data.coverImageAlt,
    score: data.review?.score,
    scaredyScore: data.review?.scaredyScore,
    subjectTitle: data.review?.subjectTitle,
    draft: data.draft,
  }
}
