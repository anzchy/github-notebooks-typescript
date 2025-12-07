import { GitHubService } from './github.service';
import { NotesCacheService } from './supabase.service';
import { NoteFilter, Note } from '../types';

export class NoteService {
  /**
   * 获取笔记列表 (Cache First Strategy)
   */
  static async getNotes(
    githubAccountId: string,
    githubToken: string,
    repoOwner: string,
    repoName: string,
    filters: NoteFilter = {}
  ): Promise<{ data: Note[]; count: number }> {
    const { page = 1, per_page = 20 } = filters;

    // 1. Try Cache
    const cached = await NotesCacheService.getNotesFromCache(githubAccountId, filters);

    // 2. Cold Start Check
    // 如果缓存为空，且是第一页，且没有任何筛选条件 -> 视为"冷启动"
    const isColdStart = 
      cached.count === 0 && 
      page === 1 && 
      !filters.search && 
      !filters.label;

    if (isColdStart) {
      console.log("❄️  Cache miss (Cold Start). Fetching from GitHub...");
      await this.syncNotes(githubAccountId, githubToken, repoOwner, repoName);
      
      // Fetch again from cache
      return NotesCacheService.getNotesFromCache(githubAccountId, filters);
    }

    return cached;
  }

  /**
   * [同步] 主动从 GitHub 拉取最新数据并更新缓存
   */
  static async syncNotes(
    githubAccountId: string,
    githubToken: string,
    repoOwner: string,
    repoName: string
  ): Promise<void> {
    const gh = new GitHubService(githubToken);
    
    // MVP: Sync first 50 issues
    const issues = await gh.listIssues(repoOwner, repoName, {
        state: 'all',
        per_page: 50
    });
    
    if (issues.length > 0) {
        await NotesCacheService.upsertNotes(githubAccountId, issues);
        console.log(`✅ Synced ${issues.length} issues to cache.`);
    } else {
        console.log("✅ Sync complete. No issues found.");
    }
  }
  
  /**
   * 创建笔记 (Write-Through)
   */
  static async createNote(
      githubAccountId: string,
      githubToken: string,
      repoOwner: string,
      repoName: string,
      data: { title: string; body?: string; labels?: string[] }
  ): Promise<Note> {
      const gh = new GitHubService(githubToken);
      
      // 1. Write to GitHub
      const newIssue = await gh.createIssue(repoOwner, repoName, data);
      
      // 2. Update Cache
      const savedNotes = await NotesCacheService.upsertNotes(githubAccountId, [newIssue]);
      return savedNotes[0];
  }
  
  /**
   * 更新笔记 (Write-Through)
   */
  static async updateNote(
      githubAccountId: string,
      githubToken: string,
      repoOwner: string,
      repoName: string,
      issueNumber: number,
      data: { title?: string; body?: string; state?: 'open'|'closed'; labels?: string[] }
  ): Promise<Note> {
      const gh = new GitHubService(githubToken);
      
      // 1. Write to GitHub
      const updatedIssue = await gh.updateIssue(repoOwner, repoName, issueNumber, data);
      
      // 2. Update Cache
      const savedNotes = await NotesCacheService.upsertNotes(githubAccountId, [updatedIssue]);
      return savedNotes[0];
  }
}
