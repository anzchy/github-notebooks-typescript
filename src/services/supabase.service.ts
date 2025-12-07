import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { Note, GitHubAccount, NoteFilter } from '../types';

export class SupabaseService {
  private static adminClient: SupabaseClient | null = null;

  // 获取拥有 Service Role 权限的客户端（用于后台操作）
  public static getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      this.adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return this.adminClient;
  }
}

export class GitHubAccountService {
  // 获取用户的 GitHub 账号配置
  static async getUserGitHubAccount(userId: string): Promise<GitHubAccount | null> {
    const client = SupabaseService.getAdminClient();
    
    const { data, error } = await client
      .from('github_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // PGRST116 is code for "The result contains 0 rows" when using single()
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching GitHub account:', error);
      throw error;
    }
    
    return data as GitHubAccount;
  }
}

export class NotesCacheService {
  // 批量插入或更新笔记缓存
  static async upsertNotes(githubAccountId: string, notes: Partial<Note>[]): Promise<Note[]> {
    if (!notes.length) return [];
    
    const client = SupabaseService.getAdminClient();
    
    // Transform data to match DB schema if needed
    // Assuming the input 'notes' are already shaped correctly or close to it
    // We explicitly map to ensure safety
    const payload = notes.map(note => ({
      github_account_id: githubAccountId,
      issue_id: note.issue_id,
      issue_number: note.issue_number,
      title: note.title,
      body: note.body || '',
      state: note.state,
      labels: note.labels, // Supabase handles array -> JSONB automatically
      html_url: note.html_url,
      github_created_at: note.github_created_at,
      github_updated_at: note.github_updated_at,
      last_synced_at: new Date().toISOString()
    }));

    const { data, error } = await client
      .from('notes_cache')
      .upsert(payload, { onConflict: 'github_account_id,issue_id' })
      .select();

    if (error) {
      console.error('Error upserting notes:', error);
      throw error;
    }

    return data as Note[];
  }

  // 获取笔记列表 (支持筛选、搜索、分页)
  static async getNotesFromCache(
    githubAccountId: string, 
    filters: NoteFilter = {}
  ): Promise<{ data: Note[]; count: number }> {
    const client = SupabaseService.getAdminClient();
    const { state, label, search, page = 1, per_page = 20 } = filters;

    let query = client
      .from('notes_cache')
      .select('*', { count: 'exact' })
      .eq('github_account_id', githubAccountId);

    // 1. State Filter
    if (state && state !== 'all') {
      query = query.eq('state', state);
    }

    // 2. Label Filter (JSONB contains)
    if (label) {
      query = query.contains('labels', [label]);
    }

    // 3. Search (Full Text Search simulation with ILIKE)
    if (search && search.trim()) {
      // Supabase PostgREST syntax for OR is a bit tricky
      // or=(column.operator.value,column.operator.value)
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    // 4. Sorting & Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, count, error } = await query
      .order('github_updated_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching notes from cache:', error);
      throw error;
    }

    return { 
      data: (data as Note[]) || [], 
      count: count || 0 
    };
  }
  
  static async getNoteByIssueNumber(githubAccountId: string, issueNumber: number): Promise<Note | null> {
      const client = SupabaseService.getAdminClient();
      const { data, error } = await client
        .from('notes_cache')
        .select('*')
        .eq('github_account_id', githubAccountId)
        .eq('issue_number', issueNumber)
        .single();
        
      if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
      }
      return data as Note;
  }
}
