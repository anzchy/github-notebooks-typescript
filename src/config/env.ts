import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server Config
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase Config
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  
  // GitHub Config
  GITHUB_DEFAULT_REPO: z.string().default('owner/repo'),
  GITHUB_TOKEN: z.string().optional(), // Optional global token
  
  // App Config
  NOTES_PER_PAGE: z.coerce.number().default(20),
});

// Validate env vars
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
