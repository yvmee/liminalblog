import type { APIRoute } from "astro"

import { lanternSvg } from "../lib/art.ts"

/** The lantern as favicon, generated from the same sprite as the site mark. */
export const GET: APIRoute = () =>
  new Response(
    lanternSvg({ padding: 2, background: "#0b1114", rounded: true }),
    {
      headers: { "Content-Type": "image/svg+xml" },
    }
  )
