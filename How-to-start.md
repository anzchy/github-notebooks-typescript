# How to Start & Configure

This guide provides a step-by-step walkthrough to configure and run the TypeScript backend. It covers the setup for **Supabase**, **GitHub**, and the local **Fastify** server using the `.env` configuration file.

## Prerequisites

- **Node.js**: Version 20 or higher.
- **Supabase Account**: For database and authentication.
- **GitHub Account**: For API access.

---

## Step 1: Environment File Setup

1. Navigate to the project root directory.
2. Copy the example environment file to create your local config:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` in your code editor. You will see variables that need to be filled in.

---

## Step 2: Configure Supabase (Database & Auth)

This project uses Supabase for storing user data (GitHub account links), caching notes, and handling authentication.

### 2.1 Get Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Once the project is ready, go to **Project Settings** (gear icon) -> **API**.
3. Copy the **Project URL** -> Set to `SUPABASE_URL` in `.env`.
4. Copy the **anon public** key -> Set to `SUPABASE_ANON_KEY` in `.env`.
   - *Used for client-side authentication.*
5. Copy the **service_role secret** key -> Set to `SUPABASE_SERVICE_KEY` in `.env`.
   - *⚠️ Critical: This key bypasses Row Level Security. Never share it. It allows the backend to manage all data.*

### 2.2 Setup Database Schema
You need to create the required tables in Supabase. Go to the **SQL Editor** in your Supabase dashboard and run the following SQL:

```sql
-- Table: users (Managed by Supabase Auth, but we can extend if needed)
-- We use the default 'auth.users' table provided by Supabase.

-- Table: github_accounts (Links local users to GitHub)
create table public.github_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  github_username text not null,
  github_token text not null, -- Stores the user's GitHub Personal Access Token
  target_repo_owner text not null,
  target_repo_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: notes_cache (Caches GitHub Issues for performance)
create table public.notes_cache (
  id uuid default gen_random_uuid() primary key,
  github_account_id uuid references public.github_accounts(id) on delete cascade not null,
  issue_id bigint not null,
  issue_number bigint not null,
  title text not null,
  body text,
  state text not null,
  labels jsonb,
  html_url text not null,
  github_created_at timestamp with time zone,
  github_updated_at timestamp with time zone,
  last_synced_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(github_account_id, issue_id)
);

-- Enable RLS (Optional for this backend-only usage, but recommended)
alter table public.github_accounts enable row level security;
alter table public.notes_cache enable row level security;
```

---

## Step 3: Configure GitHub (API Integration)

The backend uses Octokit to interact with GitHub. You need a token to inspect private repos or to avoid strict rate limits on public repos.

### 3.1 Personal Access Token (PAT)
1. Go to GitHub -> Settings -> **Developer settings**.
2. Select **Personal access tokens** -> **Tokens (classic)**.
3. Generate new token (classic).
4. Select scopes: `repo` (Full control of private repositories) is required if you want to manage notes in private repos.
5. Copy the token.

### 3.2 Configuration
There are two ways to use the token:
1. **Per-User (Recommended)**: The user provides their token via the API (login flow), stored in the `github_accounts` table.
2. **Global Fallback (Optional)**: Set `GITHUB_TOKEN` in `.env`.
   - This is useful for testing or if the app reads from a public repo without user-specific credentials.

---

## Step 4: Configure Fastify Server

These settings control how the local server runs.

- **PORT**: The port the server listens on (Default: `5000`).
- **HOST**: Network interface (Default: `0.0.0.0` to allow external access, or `127.0.0.1` for local only).
- **NODE_ENV**: Set to `development` for verbose logging and hot-reloading, or `production` for optimized performance.
- **NOTES_PER_PAGE**: Pagination limit for lists (Default: `20`).

---

## Summary: .env Reference

Your final `.env` file should look like this:

```ini
# --- Server Config ---
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# --- Supabase Config (Required) ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# --- GitHub Config ---
GITHUB_DEFAULT_REPO=anzchy/github-notebooks
# GITHUB_TOKEN=ghp_... (Optional global token)

# --- App Config ---
NOTES_PER_PAGE=20
```

## Running the Project

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server will start at `http://0.0.0.0:5000`.

3. **Verify**:
   Visit `http://localhost:5000/` to see the health check status.
