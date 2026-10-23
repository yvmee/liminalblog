# Liminal: horror games, read closely

Horror game reviews and ludology research by Lara Liebmann, served at **https://yvmee.github.io/blog/**. Astro 7 + React 19 + TypeScript + Tailwind CSS v4, pre-rendered to static HTML and deployed to GitHub Pages.

The look extends the [portfolio](https://github.com/yvmee/yvmee.github.io) (Lexend / Pixelify Sans / JetBrains Mono, 2px ink borders, pixel-stepped shadows, the night palette's coral "lamp light") into a dark editorial theme built around a pixel-art lantern.

## Quick start

Requires Node >= 24 (scripts in `scripts/` are TypeScript run directly by Node).

```bash
npm install
npm run dev        # http://localhost:4321/blog/ (drafts visible)
npm run new-post   # scaffold a post interactively
npm run build      # astro check + static build into dist/
npm run verify     # check dist/: links, /blog base path, canonicals, JSON-LD, feeds
npm run preview    # serve dist/ at http://localhost:4321/blog/
npm run covers     # regenerate og-default.png, icons, and missing post covers
npm run format     # prettier
```

## Writing posts

```bash
npm run new-post
# or non-interactively:
npm run new-post -- --title "Signalis Review" --category horror-games --review
```

This creates `src/content/posts/<slug>.mdx` (as a **draft**), `public/images/posts/<slug>/` and a placeholder `cover.png`. Fill in the TODOs, replace the cover with a 1200x630 image, and set `draft: false` to publish.

- **Frontmatter** is validated by `src/content.config.ts` (Astro 7 requires this location; `src/content/config.ts` is rejected). The build fails with a readable error if, for example, `description` is not 120–160 characters or a score is not in 0.5 steps.
- **Paths**: write images and links relative to the site root, without `/blog`: `/images/posts/<slug>/shot.png`, `[press kit](/press/)`. The base path is added automatically in Markdown and in components.
- **Reviews**: add a `review` block and the verdict box, badges and `Review` JSON-LD appear automatically. Both ratings are optional:
  - `score`: quality, 0–10 in 0.5 steps (becomes the JSON-LD `reviewRating`)
  - `scaredyScore`: the Scaredy-Cat Scale for readers who scare easily, 1 (do not play) to 10 (not scary at all)
- **MDX components**, no import needed:
  - `<ResearchCallout title="..." source="...">` (also `kind="mechanics" | "design" | "sound"`)
  - `<MechanicsBreakdown title="...">`
  - `<ImageFigure src="/images/..." alt="..." caption="..." credit="..." />`
  - `<YouTubeEmbed id="VIDEO_ID" title="..." />` (loads nothing from YouTube until clicked)
- **In the browser**: `.pages.yml` configures [Pages CMS](https://pagescms.org). Sign in at app.pagescms.org with GitHub and open this repo.

## Configuration

Everything that identifies the publication lives in `src/config/site.ts`: site URL and base path, name and tagline, author bio and profiles, press contact, the category list (add one and it becomes a valid frontmatter value, filter tab and archive page; mirror it in `.pages.yml`), and the scoring rubric.

## What gets built

| URL                       | Source                                  |
| ------------------------- | --------------------------------------- |
| `/blog/`                  | `src/pages/index.astro`                 |
| `/blog/<slug>/`           | `src/pages/[slug].astro`                |
| `/blog/category/<key>/`   | only for categories with posts          |
| `/blog/press/`            | press kit & editorial policy            |
| `/blog/rss.xml`           | `src/pages/rss.xml.ts`                  |
| `/blog/sitemap-index.xml` | `@astrojs/sitemap` (with `lastmod`)     |
| `/blog/favicon.svg`       | generated from the lantern sprite       |
| `/blog/404.html`          | served by GitHub Pages for missing URLs |

## Deployment

`.github/workflows/deploy.yml` builds, verifies and deploys on every push to `main`.

1. The GitHub repository must be named **`blog`** (under `yvmee`), since GitHub Pages serves a project repo at `/<repo-name>/`. To use another name, change `BASE_PATH` in `src/config/site.ts`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Crawlers only read `robots.txt` at the domain root, which comes from the portfolio repo. Add `Sitemap: https://yvmee.github.io/blog/sitemap-index.xml` there so search engines find the blog sitemap. Submitting it in Google Search Console and Bing Webmaster Tools also helps.
