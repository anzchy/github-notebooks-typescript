export interface Note {
  id?: string; // Supabase internal ID
  github_account_id: string;
  issue_id: number;
  issue_number: number;
  title: string;
  body: string | null;
  state: string;
  labels: string[]; // JSONB array of strings
  html_url: string;
  github_created_at: string;
  github_updated_at: string;
  last_synced_at?: string;
}

export interface GitHubAccount {
  id: string;
  user_id: string;
  github_username: string;
  github_token: string;
  target_repo_owner: string;
  target_repo_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface NoteFilter {
  state?: 'open' | 'closed' | 'all';
  label?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
