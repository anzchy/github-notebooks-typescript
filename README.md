# GitHub Notebooks Backend (TypeScript)

High-performance backend rewrite using Fastify, Node.js, and TypeScript.

## Features

- **Fastify**: High throughput web framework.
- **TypeScript**: Type safety and better maintainability.
- **Supabase**: Database and Authentication.
- **Octokit**: GitHub API integration.
- **Zod**: Runtime validation.

## Prerequisites

- Node.js 20+
- Supabase Account
- GitHub Token

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. Run Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- `GET /`: Health Check
- `GET /api/notes`: List notes (Requires Auth)
- `POST /api/notes`: Create note
- `POST /api/notes/sync`: Force sync from GitHub

## Project Structure

- `src/app.ts`: Entry point
- `src/config`: Environment config
- `src/controllers`: Request handlers
- `src/middleware`: Auth middleware
- `src/routes`: API definitions
- `src/schemas`: Zod schemas
- `src/services`: Business logic (GitHub, Supabase)
- `src/types`: TypeScript interfaces
