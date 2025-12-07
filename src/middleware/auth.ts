import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { GitHubAccountService } from '../services/supabase.service';
import { GitHubAccount } from '../types';

// Create a client specifically for auth verification
const authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email?: string;
    };
    githubAccount?: GitHubAccount;
  }
}

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return reply.status(401).send({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await authClient.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  req.user = {
    id: user.id,
    email: user.email
  };
};

export const requireGitHub = async (req: FastifyRequest, reply: FastifyReply) => {
  // Ensure requireAuth is run first
  if (!req.user) {
    await requireAuth(req, reply);
    if (!req.user) return; // Response sent in requireAuth
  }

  const ghAccount = await GitHubAccountService.getUserGitHubAccount(req.user!.id);
  
  if (!ghAccount) {
    return reply.status(400).send({ 
      error: 'GitHub account not connected', 
      code: 'GITHUB_CONNECTION_REQUIRED' 
    });
  }

  req.githubAccount = ghAccount;
};
