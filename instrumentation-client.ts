import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest"

// Only initialize PostHog in the browser and when we have a key.
// This also avoids noisy network errors in local development when the
// analytics endpoint is not reachable.
if (typeof window !== "undefined" && POSTHOG_KEY) {
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: "https://us.posthog.com",
      capture_exceptions: true, // Enable Error Tracking; set to false if you don't want this
      debug: process.env.NODE_ENV === "development",
    })
  } catch (error) {
    // Swallow init errors so they don't break the app in development.
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog init failed", error)
    }
  }
}
