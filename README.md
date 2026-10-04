# SSE Encyclopedia

This repository is a Next.js application for the Social and Solidarity Economy encyclopedia platform.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local environment file based on the example:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the required values in `.env.local`.
4. Run the app:
   ```bash
   npm run dev
   ```

## Required environment variables

Copy the values from `.env.example` and replace the placeholders before deployment.

- `DATABASE_URL`: database connection string. For production, prefer PostgreSQL instead of SQLite.
- `NEXTAUTH_SECRET`: strong secret for NextAuth session signing.
- `NEXTAUTH_URL`: canonical app URL for authentication flows.
- `NEXT_PUBLIC_WORDPRESS_URL`: WordPress base URL for published editorial content.
- `GEMINI_API_KEY`: server-only Gemini API key for AI country comparison.

## Production deployment checklist

Before deployment, confirm all of the following:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Prisma client is generated: `npm run db:generate`.
- Database is migrated for the target environment: `npm run db:migrate`.
- The app health endpoint is reachable at `/health`.
- `NEXTAUTH_SECRET` and `DATABASE_URL` are set in the deployment platform secrets.
- `GEMINI_API_KEY` is stored as a server-only secret and never exposed to the browser.
- `NEXT_PUBLIC_WORDPRESS_URL` points to the correct public WordPress origin.

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
npm run db:migrate
```

## Notes

- The app uses Prisma + SQLite in local development by default.
- For production hosting, move to a managed PostgreSQL database before relying on the app at scale.
- The AI comparison feature remains optional; if `GEMINI_API_KEY` is missing, the app keeps local comparisons available but disables the Gemini-backed comparison.

