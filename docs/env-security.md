# Environment & Secret Handling

This project follows secure patterns for environment variables and secrets.

- Public variables: must be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API_URL`). These are safe to expose in client bundles and can be used in components that render on the client.
- Private variables: must NOT be prefixed. Example: `DATABASE_URL`. Read only from server contexts (API routes, server actions, database layers) and never leak to the browser.

## Files & Git

- Only the template file is committed: `.env.example`.
- Real environment files are ignored by Git: `.env`, `.env.development`, `.env.staging`, `.env.production`, and `*.local` variants (see `.gitignore`).

## Local development

- Copy `.env.example` to `.env.development` (or `.env`) and fill values locally.
- Do not commit real `.env*` files.

## CI

- Use GitHub Secrets to inject env vars. The workflow reads `NEXT_PUBLIC_API_URL` and `DATABASE_URL` from secrets at build time.

See `src/lib/env.ts` for usage helpers and comments.
