/**
 * JSON-LD builders (schema.org). Pages compose these into one @graph so the
 * author, publication and article reference each other by @id.
 */
import { author, categories, reviewItemType, site } from "../config/site.ts"
import { absoluteUrl } from "./paths.ts"
import type { Post } from "./posts.ts"

export type JsonLd = Record<string, unknown>

export const ids = {
  website: absoluteUrl("/#website"),
  blog: absoluteUrl("/#blog"),
  author: absoluteUrl("/press/#author"),
}

export function personSchema(): JsonLd {
  return {
    "@type": "Person",
    "@id": ids.author,
    name: author.name,
    givenName: author.givenName,
    familyName: author.familyName,
    jobTitle: author.jobTitle,
    description: author.shortBio,
    url: site.portfolioUrl,
    email: `mailto:${author.email}`,
    affiliation: { "@type": "CollegeOrUniversity", ...author.affiliation },
    alumniOf: { "@type": "CollegeOrUniversity", ...author.alumniOf },
    knowsAbout: [
      "Horror video games",
      "Ludology",
      "Game design",
      "Game development",
      "Virtual reality",
      "Human perception",
    ],
    sameAs: author.profiles.map((p) => p.url),
  }
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    name: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    inLanguage: site.lang,
    publisher: { "@id": ids.author },
    publishingPrinciples: absoluteUrl("/press/#ethics"),
  }
}

export function blogSchema(posts: Post[]): JsonLd {
  return {
    "@type": "Blog",
    "@id": ids.blog,
    name: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    isPartOf: { "@id": ids.website },
    author: { "@id": ids.author },
    blogPost: posts
      .slice(0, 20)
      .map((p) => ({ "@id": absoluteUrl(`/${p.id}/#article`) })),
  }
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * BlogPosting (or ScholarlyArticle for research). Reviews additionally get a
 * Review node whose itemReviewed is a VideoGame or Movie per category.
 */
export function articleSchemas(post: Post, wordCount: number): JsonLd[] {
  const { data } = post
  const url = absoluteUrl(`/${post.id}/`)
  const isResearch = data.category === "ludology-research"
  const image = absoluteUrl(data.coverImage)

  const article: JsonLd = {
    "@type": isResearch ? "ScholarlyArticle" : "BlogPosting",
    "@id": `${url}#article`,
    headline: data.title,
    description: data.description,
    url,
    mainEntityOfPage: url,
    image: { "@type": "ImageObject", url: image, caption: data.coverImageAlt },
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    inLanguage: site.lang,
    articleSection: categories[data.category].label,
    keywords: data.tags.join(", "),
    wordCount,
    author: { "@id": ids.author },
    publisher: { "@id": ids.author },
    isPartOf: { "@id": ids.blog },
  }

  if (!data.review) return [article]

  const r = data.review
  const itemType = reviewItemType(data.category)
  const subjectId = `${url}#subject`
  const itemReviewed: JsonLd =
    itemType === "Movie"
      ? {
          "@type": "Movie",
          "@id": subjectId,
          name: r.subjectTitle,
          director: { "@type": "Person", name: r.creator },
          dateCreated: String(r.releaseYear),
          genre: ["Horror", r.horrorSubgenre],
          ...(r.publisher && {
            productionCompany: { "@type": "Organization", name: r.publisher },
          }),
        }
      : {
          "@type": "VideoGame",
          "@id": subjectId,
          name: r.subjectTitle,
          author: { "@type": "Organization", name: r.creator },
          ...(r.publisher && {
            publisher: { "@type": "Organization", name: r.publisher },
          }),
          datePublished: String(r.releaseYear),
          genre: ["Horror", r.horrorSubgenre],
          ...(r.platforms?.length && { gamePlatform: r.platforms }),
          applicationCategory: "Game",
        }

  const review: JsonLd = {
    "@type": "Review",
    "@id": `${url}#review`,
    name: data.title,
    url,
    itemReviewed,
    // The Scaredy-Cat Scale has no schema.org equivalent; only the quality score is a Rating
    ...(r.score !== undefined && {
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.score,
        bestRating: 10,
        worstRating: 0,
      },
    }),
    reviewBody: r.verdict,
    positiveNotes: {
      "@type": "ItemList",
      itemListElement: r.pros.map((name, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
      })),
    },
    negativeNotes: {
      "@type": "ItemList",
      itemListElement: r.cons.map((name, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
      })),
    },
    datePublished: data.pubDate.toISOString(),
    author: { "@id": ids.author },
    publisher: { "@id": ids.author },
  }

  return [{ ...article, about: { "@id": subjectId } }, review]
}

export function graph(...nodes: JsonLd[]) {
  return { "@context": "https://schema.org", "@graph": nodes }
}
