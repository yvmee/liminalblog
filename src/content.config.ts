/**
 * Content collections. Astro 7 reads this file from src/content.config.ts
 * (the old src/content/config.ts location is rejected at build time).
 * Mirror any schema change in .pages.yml and scripts/new-post.ts.
 */
import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

import { categoryKeys } from "./config/site.ts"

const review = z.object({
  /** Game or movie title */
  subjectTitle: z.string(),
  /** Developer / studio / director */
  creator: z.string(),
  publisher: z.string().optional(),
  releaseYear: z.number().int().min(1900).max(2100),
  platforms: z.array(z.string()).optional(),
  horrorSubgenre: z.string(),
  /** Quality score, 0-10 in 0.5 steps (optional) */
  score: z
    .number()
    .min(0)
    .max(10)
    .refine((n) => Number.isInteger(n * 2), "Score must be in 0.5 steps")
    .optional(),
  /** Scaredy-Cat Scale, 1 (do not play) to 10 (not scary at all) (optional) */
  scaredyScore: z.number().int().min(1).max(10).optional(),
  verdict: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  /** How the reviewer got access, e.g. "Review copy provided by publisher" */
  disclosure: z.string().optional(),
})

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().max(110),
    description: z
      .string()
      .min(120, "Description should be 120-160 characters for search snippets")
      .max(160, "Description should be 120-160 characters for search snippets"),
    pubDate: z.coerce.date(),
    updatedDate: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.date().optional()
    ),
    category: z.enum(categoryKeys),
    tags: z.array(z.string()).default([]),
    /** Path relative to the site root, e.g. /images/posts/<slug>/cover.png */
    coverImage: z.string(),
    coverImageAlt: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    // The CMS may save an empty review object for non-review posts
    review: z.preprocess(
      (value) =>
        value &&
        typeof value === "object" &&
        "subjectTitle" in value &&
        value.subjectTitle
          ? value
          : undefined,
      review.optional()
    ),
  }),
})

export const collections = { posts }
