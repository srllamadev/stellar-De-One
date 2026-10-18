// NEXT_PUBLIC variables are public and inlined at build/dev startup.
export const publicEnv = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, ""),
  pollarPublishableKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY || "",
} as const;
