/**
 * Central site configuration. Everything that identifies the publication
 * (URLs, author, press contact, categories, scoring rubric) lives here so
 * pages, JSON-LD, RSS and the CMS stay in sync.
 *
 * Imported by astro.config.mjs and Node scripts, so keep it free of Astro or
 * Vite-only imports.
 */

/** Origin of the GitHub Pages user site, without a trailing slash. */
export const SITE_URL = "https://yvmee.github.io"

/**
 * Sub-path the blog is served from. GitHub Pages serves a project repository
 * named `blog` at `<user>.github.io/blog`, so this must match the repo name.
 */
export const BASE_PATH = "/liminalblog"

export const site = {
  name: "Liminal",
  tagline: "Horror games, read closely",
  description:
    "Analytical horror game reviews and ludology research from a game developer, academic and person scared of playing horror games: how fear is designed, systematised and felt.",
  lang: "en",
  locale: "en_US",
  /** Main portfolio, linked from the nav and used as the author's url */
  portfolioUrl: `${SITE_URL}/`,
  /** Default social card, relative to the site root (base path added automatically) */
  defaultOgImage: "/og-default.png",
  defaultOgImageAlt:
    "A pixel-art lantern glowing in the dark above the word Liminal",
  /** Year the publication started, for the copyright line */
  since: 2026,
} as const

export const author = {
  name: "Lara Liebmann",
  givenName: "Lara",
  familyName: "Liebmann",
  handle: "yvmee",
  jobTitle: "Game Developer & Horror Researcher",
  shortBio:
    "Game developer and PhD researcher at ETH Zurich studying perception in virtual environments. M.Sc. Informatics: Games Engineering (TUM). Shipped Off Course on Steam and showed it at Gamescom 2025.",
  affiliation: { name: "ETH Zurich", url: "https://ethz.ch" },
  alumniOf: {
    name: "Technical University of Munich",
    url: "https://www.tum.de",
  },
  location: "Munich, Germany & Zurich, Switzerland",
  email: "laraemelie.li@gmail.com",
  /** Profiles that identify the author (JSON-LD sameAs and the author bio) */
  profiles: [
    { label: "Portfolio", url: `${SITE_URL}/` },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/lara-liebmann" },
    { label: "GitHub", url: "https://github.com/yvmee" },
    { label: "itch.io", url: "https://yvme.itch.io/" },
  ],
} as const

export const press = {
  email: author.email,
  /** Subject line prefix that keeps review-code requests filterable */
  subjectPrefix: "[Review Code]",
  responseTime: "within 3 working days",
  /** Platforms the author can review on; shown in the press kit. Add consoles you own. */
  platforms: ["PC (Steam, GOG, Epic Games Store, itch.io)"],
  languages: ["English", "German"],
} as const

/**
 * Categories. Add a key here and it becomes a valid frontmatter value,
 * a filter tab, an archive page, and a CMS option.
 */
export const categories = {
  "horror-games": {
    label: "Horror Games",
    short: "Games",
    description:
      "Critical reviews and design analyses of horror video games, from survival horror classics to analog-horror indies.",
    /** schema.org type for the reviewed item */
    reviewItemType: "VideoGame",
  },
  // Removed for now. To bring film coverage back, uncomment this block and
  // add the option to .pages.yml (reviews then get Movie JSON-LD).
  // "horror-movies": {
  //   label: "Horror Movies",
  //   short: "Movies",
  //   description:
  //     "Horror film criticism through a game developer's lens: adaptation, staging, sound and how cinema and games borrow each other's fear.",
  //   reviewItemType: "Movie",
  // },
  "ludology-research": {
    label: "Ludology Research",
    short: "Research",
    description:
      "Long-form ludology research on horror: mechanics, systems, perception and player affect, written with academic rigour.",
    reviewItemType: "VideoGame",
  },
  "event-coverage": {
    label: "Event Coverage",
    short: "Events",
    description:
      "Reports, hands-on previews and developer conversations from Gamescom, Summer Game Fest and other industry events.",
    reviewItemType: "VideoGame",
  },
} as const satisfies Record<
  string,
  {
    label: string
    short: string
    description: string
    reviewItemType: ReviewItemType
  }
>

/** schema.org type of the work a review covers */
export type ReviewItemType = "VideoGame" | "Movie"

export type CategoryKey = keyof typeof categories

export const reviewItemType = (category: CategoryKey): ReviewItemType =>
  categories[category].reviewItemType
export const categoryKeys = Object.keys(categories) as [
  CategoryKey,
  ...CategoryKey[],
]

/** Quality score rubric (0-10). Half points sit between two bands and use the lower label. */
export const scoreRubric = [
  {
    score: 10,
    label: "Masterpiece",
    text: "Defines or redefines the genre. Flaws are negligible next to what it achieves.",
  },
  {
    score: 9,
    label: "Essential",
    text: "Outstanding craft and a lasting idea. Required play for anyone who cares about horror.",
  },
  {
    score: 8,
    label: "Excellent",
    text: "Confident, memorable, frightening. Minor issues that never break the spell.",
  },
  {
    score: 7,
    label: "Very Good",
    text: "Strong design with noticeable rough edges. Easy to recommend to genre fans.",
  },
  {
    score: 6,
    label: "Good",
    text: "Solid and enjoyable, but leans on familiar ideas or uneven execution.",
  },
  {
    score: 5,
    label: "Mixed",
    text: "Real strengths and real problems in equal measure. Worth it for specific audiences.",
  },
  {
    score: 4,
    label: "Flawed",
    text: "Interesting intentions undermined by design, technical or pacing problems.",
  },
  {
    score: 3,
    label: "Poor",
    text: "Rarely frightening or engaging. A few ideas survive, the whole does not.",
  },
  {
    score: 2,
    label: "Bad",
    text: "Fundamental problems across most of the experience.",
  },
  {
    score: 1,
    label: "Broken",
    text: "Barely functional, or actively hostile to the player without purpose.",
  },
  {
    score: 0,
    label: "Unrated",
    text: "Reserved for works that cannot be completed or assessed in good faith.",
  },
] as const

export function scoreLabel(score: number) {
  const band = scoreRubric.find((r) => score >= r.score)
  return band?.label ?? "Unrated"
}

/**
 * Scaredy-Cat Scale: a second, independent rating for readers who are scared
 * of horror. 1 = do not play, you will quit; 10 = not scary to play at all.
 * Whole numbers only. Each band covers two values.
 */
export const scaredyScale = {
  name: "Scaredy-Cat Scale",
  short: "Scaredy-Cat",
  bands: [
    {
      min: 9,
      label: "Not scary",
      text: "Unsettling at most. Safe for anyone, even if you have never finished a horror game.",
    },
    {
      min: 7,
      label: "Gentle",
      text: "A few tense moments or mild jump scares; atmosphere over shock. A good first horror game.",
    },
    {
      min: 5,
      label: "Manageable",
      text: "Regular scares and tension, but with breathers, safe rooms or ways to cope. Play in daylight or with a friend.",
    },
    {
      min: 3,
      label: "Intense",
      text: "Sustained dread, chases or disturbing content. Only if you are curious and ready to push through.",
    },
    {
      min: 1,
      label: "Do not play",
      text: "Relentless. You will likely quit within the first hour; watch someone else play instead.",
    },
  ],
} as const

export function scaredyLabel(score: number) {
  return scaredyScale.bands.find((b) => score >= b.min)?.label ?? "Do not play"
}
