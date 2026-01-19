/**
 * Environment access helpers.
 *
 * Security model:
 * - Public variables: prefixed with NEXT_PUBLIC_. These may be embedded in client bundles and
 *   are therefore considered non-secret. They can be read in both Server and Client Components.
 * - Private variables: NOT prefixed. These must ONLY be read on the server (e.g., API routes,
 *   server actions, database layers). Never import server-only functions into client components.
 *
 * Usage:
 * - Provide real values via runtime environment (.env files locally, GitHub Secrets in CI).
 * - Do not hardcode secrets in source control. Only `.env.example` is committed as a template.
 */
export const publicEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
};

export function getDatabaseUrl() {
  // Only call this in server-only contexts; it must never leak to the browser bundle.
  // If you need to pass derived values to the client, sanitize/strip sensitive parts first.
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing; set it in the server environment."
    );
  }
  return url;
}
