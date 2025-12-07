# GitHub Notebooks Backend (TypeScript)

High-performance backend rewrite using Fastify, Node.js, and TypeScript.

## Features

- **Fastify**: High throughput web framework.
- **TypeScript**: Type safety and better maintainability.
- **Supabase**: Database and Authentication.
- **Octokit**: GitHub API integration.
- **Zod**: Runtime validation.
- **Docker**: Containerized deployment support.

## Documentation

- [How to Start (Local Development)](./How-to-start.md)
- [How to Deploy (Production)](./How-to-deploy.md)

## Prerequisites

- Node.js 20+
- Supabase Account
- GitHub Token

## Quick Start (Local)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET /`: Health Check
- `GET /api/notes`: List notes (Requires Auth)
- `POST /api/notes`: Create note
- `POST /api/notes/sync`: Force sync from GitHub

## Caveats & Notes

- **Supabase Service Key**: The `SUPABASE_SERVICE_KEY` is powerful (bypasses RLS). It is used by the backend to perform admin tasks (e.g., syncing caches). **Never expose this key to the client-side frontend.**
- **GitHub Rate Limits**: Without a `GITHUB_TOKEN`, requests are limited to 60/hour. Authenticated requests get 5,000/hour. This backend uses the user's token when available, or falls back to a global token if configured.
- **Type Safety**: Due to `fastify-type-provider-zod`, ensuring your route schemas match your controller logic is critical. Type errors will prevent the app from building.

## Troubleshooting

### 1. `Error: Missing authorization header`
- **Cause**: You are trying to access protected endpoints (like `/api/notes`) without a Bearer token.
- **Fix**: Include `Authorization: Bearer <SUPABASE_JWT>` in your request header.

### 2. `Unable to compile TypeScript`
- **Cause**: Usually due to mismatched types between Zod schemas and request handlers.
- **Fix**: Run `npm run build` locally to see detailed error messages. Ensure your Controller parameters use `FastifyRequest` generic types compatible with your Zod schemas, or use type assertions (`as ListNotesQuery`) inside the controller.

### 3. `502 Bad Gateway` (Nginx)
- **Cause**: The Node.js app is not running or crashed.
- **Fix**: Check PM2 logs (`pm2 logs`) or Docker logs (`docker compose logs`). Ensure the app is listening on the correct port (default 5000).

### 4. Database Errors (RLS)
- **Cause**: If you see "permission denied" errors from Supabase.
- **Fix**: Ensure your `SUPABASE_SERVICE_KEY` is correct in `.env`. The backend primarily uses the Service Role key to manage the `notes_cache` table.

## Project Structure

- `src/app.ts`: Entry point
- `src/config`: Environment config
- `src/controllers`: Request handlers
- `src/middleware`: Auth middleware
- `src/routes`: API definitions
- `src/schemas`: Zod schemas
- `src/services`: Business logic (GitHub, Supabase)
- `src/types`: TypeScript interfaces
