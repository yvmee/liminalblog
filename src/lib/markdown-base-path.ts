/**
 * Sätteri hast plugin (Astro 7's Markdown processor): prefixes root-relative
 * links and image sources in Markdown/MDX with the base path, so authors can
 * write `![](/images/posts/x/a.png)` or `[press kit](/press/)` and it
 * resolves under /blog.
 */
import { defineHastPlugin } from "satteri"

import { asset, href } from "./paths.ts"

const attributes: Record<string, string[]> = {
  a: ["href"],
  img: ["src"],
  source: ["src"],
  video: ["src", "poster"],
  audio: ["src"],
}

const isRootRelative = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")

export const basePathPlugin = defineHastPlugin({
  name: "base-path",
  element: {
    filter: Object.keys(attributes),
    visit(node, ctx) {
      for (const name of attributes[node.tagName] ?? []) {
        const value = node.properties?.[name]
        if (isRootRelative(value))
          ctx.setProperty(
            node,
            name,
            node.tagName === "a" ? href(value) : asset(value)
          )
      }
    },
  },
})
