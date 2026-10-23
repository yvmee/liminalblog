// @ts-check
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import { satteri } from "@astrojs/markdown-satteri"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import { existsSync, readdirSync, readFileSync } from "node:fs"

import { BASE_PATH, SITE_URL } from "./src/config/site.ts"
import { basePathPlugin } from "./src/lib/markdown-base-path.ts"

const postsDir = "./src/content/posts"

/** slug -> last modified date, read from post frontmatter for the sitemap */
const postDates = Object.fromEntries(
  // The folder may be missing in a fresh clone (Git does not keep empty folders)
  (existsSync(postsDir) ? readdirSync(postsDir) : [])
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const source = readFileSync(`${postsDir}/${file}`, "utf8")
      /** @param {string} key */
      const date = (key) =>
        source.match(new RegExp(`^${key}:\\s*["']?([\\d-]+)`, "m"))?.[1]
      return [
        file.replace(/\.mdx?$/, ""),
        date("updatedDate") ?? date("pubDate"),
      ]
    })
)

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // GitHub Pages serves /blog/post/ from /blog/post/index.html
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith("/404/"),
      serialize(item) {
        const slug = new URL(item.url).pathname
          .split("/")
          .filter(Boolean)
          .at(-1)
        const date = slug && postDates[slug]
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item
      },
    }),
  ],
  markdown: {
    // Astro 7's default Markdown processor; also used for .mdx
    processor: satteri({ hastPlugins: [basePathPlugin] }),
    shikiConfig: { theme: "vitesse-dark" },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
