import { FastifyReply, FastifyRequest } from 'fastify';
import { NoteService } from '../services/note.service';
import { ListNotesQuery, CreateNoteBody } from '../schemas/note.schema';

export class NoteController {
  
  static async listNotes(req: FastifyRequest, reply: FastifyReply) {
    const { github_token, target_repo_owner, target_repo_name, id: github_account_id } = req.githubAccount!;
    const query = req.query as ListNotesQuery;
    
    const notes = await NoteService.getNotes(
      github_account_id,
      github_token,
      target_repo_owner,
      target_repo_name,
      query
    );
    
    return notes;
  }

  static async syncNotes(req: FastifyRequest, reply: FastifyReply) {
    const { github_token, target_repo_owner, target_repo_name, id: github_account_id } = req.githubAccount!;
    
    await NoteService.syncNotes(
      github_account_id,
      github_token,
      target_repo_owner,
      target_repo_name
    );
    
    return { success: true, message: 'Sync started' };
  }

  static async createNote(req: FastifyRequest, reply: FastifyReply) {
      const { github_token, target_repo_owner, target_repo_name, id: github_account_id } = req.githubAccount!;
      const body = req.body as CreateNoteBody;
      
      const note = await NoteService.createNote(
          github_account_id,
          github_token,
          target_repo_owner,
          target_repo_name,
          body
      );
      
      return note;
  }
}
