/** "22 Oct 2026". UTC so server and client render the same string. */
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export const isoDate = (date: Date | string) =>
  new Date(date).toISOString().slice(0, 10)

/** 9.5 -> "9.5", 9 -> "9" */
export const formatScore = (score: number) =>
  Number.isInteger(score) ? String(score) : score.toFixed(1)

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}
