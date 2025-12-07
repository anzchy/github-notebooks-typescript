import { Octokit } from 'octokit';
import { Note } from '../types';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  // 获取当前用户信息
  async getUserInfo() {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return {
      username: data.login,
      avatar_url: data.avatar_url,
      name: data.name,
      email: data.email
    };
  }

  // 获取 Issues 列表
  async listIssues(
    owner: string, 
    repo: string, 
    options: { 
      state?: 'open' | 'closed' | 'all', 
      page?: number, 
      per_page?: number 
    } = {}
  ): Promise<Partial<Note>[]> {
    const { state = 'open', page = 1, per_page = 20 } = options;

    console.log(`📖 Fetching issues from ${owner}/${repo} (state=${state}, page=${page})`);

    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      sort: 'updated',
      direction: 'desc',
      page,
      per_page,
    });

    // Convert to internal Note format
    return data
      .filter((issue: any) => !issue.pull_request) // Exclude PRs
      .map((issue: any) => this._issueToNote(issue));
  }
  
  // 创建 Issue
  async createIssue(owner: string, repo: string, note: { title: string; body?: string; labels?: string[] }) {
      const { data } = await this.octokit.rest.issues.create({
          owner,
          repo,
          title: note.title,
          body: note.body || '',
          labels: note.labels
      });
      return this._issueToNote(data);
  }
  
  // 更新 Issue
  async updateIssue(owner: string, repo: string, issue_number: number, update: { title?: string; body?: string; state?: 'open'|'closed'; labels?: string[] }) {
      const { data } = await this.octokit.rest.issues.update({
          owner,
          repo,
          issue_number,
          ...update
      });
      return this._issueToNote(data);
  }

  // Helper: Convert GitHub Issue to Note structure
  // Matches Python's _issue_to_dict
  private _issueToNote(issue: any): Partial<Note> {
    return {
      issue_id: issue.id,
      issue_number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      html_url: issue.html_url,
      // Map label objects to strings
      labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
      github_created_at: issue.created_at,
      github_updated_at: issue.updated_at,
    };
  }
}
