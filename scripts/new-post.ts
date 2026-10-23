/**
 * Scaffolds a new post: src/content/posts/<slug>.mdx with frontmatter,
 * public/images/posts/<slug>/ and a placeholder cover.png.
 *
 *   npm run new-post
 *   npm run new-post -- --title "Signalis Review" --category horror-games --review
 *
 * New posts start as drafts: visible in `npm run dev`, excluded from builds.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import {
  categories,
  categoryKeys,
  reviewItemType,
  type CategoryKey,
} from "../src/config/site.ts"
import { writeCover } from "./covers.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const { values: flags } = parseArgs({
  options: {
    title: { type: "string" },
    category: { type: "string" },
    review: { type: "boolean" },
  },
})

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "")
}

const yaml = (text: string) => JSON.stringify(text)

async function ask() {
  const rl = createInterface({ input, output })
  try {
    let title = flags.title?.trim() ?? ""
    while (!title) title = (await rl.question("Post title: ")).trim()

    let category = flags.category as CategoryKey | undefined
    while (!category || !categoryKeys.includes(category)) {
      console.log("\nCategory:")
      categoryKeys.forEach((key, i) =>
        console.log(`  ${i + 1}) ${categories[key].label}  (${key})`)
      )
      const answer = (await rl.question("Choose a number or key: ")).trim()
      category = (categoryKeys[Number(answer) - 1] ?? answer) as CategoryKey
    }

    let review = flags.review
    if (review === undefined) {
      const answer = (await rl.question("Is this a review? (y/N): "))
        .trim()
        .toLowerCase()
      review = answer === "y" || answer === "yes"
    }
    return { title, category, review }
  } finally {
    rl.close()
  }
}

function frontmatter(
  title: string,
  slug: string,
  category: CategoryKey,
  review: boolean
) {
  const today = new Date().toISOString().slice(0, 10)
  const isMovie = reviewItemType(category) === "Movie"
  const lines = [
    "---",
    `title: ${yaml(title)}`,
    "# 120-160 characters: shown in search results and social cards",
    `description: ${yaml("TODO: write a 120-160 character summary of what readers get from this post. It is shown in search results and on social cards.")}`,
    `pubDate: ${today}`,
    "# updatedDate: " + today,
    `category: ${category}`,
    "tags:",
    "  - TODO",
    `coverImage: /images/posts/${slug}/cover.png`,
    `coverImageAlt: ${yaml("TODO: describe the cover image")}`,
    "featured: false",
    "# Drafts show in `npm run dev` only. Set to false to publish.",
    "draft: true",
  ]
  if (review) {
    lines.push(
      "review:",
      `  subjectTitle: ${yaml(title)}`,
      `  # ${isMovie ? "Director" : "Developer / studio"}`,
      `  creator: ${yaml("TODO")}`,
      `  publisher: ${yaml("TODO")}`,
      `  releaseYear: ${new Date().getFullYear()}`,
      ...(isMovie ? [] : ["  platforms:", "    - PC"]),
      `  horrorSubgenre: ${yaml("TODO, e.g. Psychological Survival")}`,
      "  # Both scales are optional; delete a line to leave it out. See /press/#scoring",
      "  # Quality: 0-10 in 0.5 steps",
      "  score: 7",
      "  # Scaredy-Cat Scale: 1 (do not play, you will quit) to 10 (not scary at all)",
      "  scaredyScore: 5",
      `  verdict: ${yaml("TODO: one or two sentence verdict.")}`,
      "  pros:",
      `    - ${yaml("TODO")}`,
      "  cons:",
      `    - ${yaml("TODO")}`,
      `  disclosure: ${yaml("Purchased independently. No review copy or compensation received.")}`
    )
  }
  lines.push("---")
  return lines.join("\n")
}

const body = (slug: string) => `
Opening paragraph. The first letter becomes a drop cap.

## First section

Headings (##, ###) build the table of contents automatically.

<ResearchCallout title="A research note">

Callouts work without imports: \`<ResearchCallout>\`, \`<MechanicsBreakdown>\`,
\`<ImageFigure>\` and \`<YouTubeEmbed>\`.

</ResearchCallout>

<ImageFigure
  src="/images/posts/${slug}/cover.png"
  alt="Describe the image"
  caption="Put images in public/images/posts/${slug}/ and reference them from /images/..."
/>

{/* <YouTubeEmbed id="VIDEO_ID" title="Trailer" /> */}
`

async function main() {
  const { title, category, review } = await ask()
  const slug = slugify(title)
  if (!slug) throw new Error("The title needs at least one letter or digit.")

  const postFile = join(root, "src/content/posts", `${slug}.mdx`)
  if (existsSync(postFile)) {
    console.error(`✗ ${relative(root, postFile)} already exists.`)
    process.exit(1)
  }

  const imageDir = join(root, "public/images/posts", slug)
  mkdirSync(imageDir, { recursive: true })
  mkdirSync(dirname(postFile), { recursive: true })
  writeFileSync(
    postFile,
    `${frontmatter(title, slug, category, review)}\n${body(slug)}`
  )
  await writeCover(join(imageDir, "cover.png"), {
    seed: slug,
    category,
    label: title,
  })

  console.log(`
✓ Created ${relative(root, postFile)}
✓ Created ${relative(root, imageDir)}/ with a placeholder cover.png

Next: fill in the TODOs, run \`npm run dev\` and open http://localhost:4321/blog/${slug}/
Set \`draft: false\` when it is ready to publish.`)
}

await main()
