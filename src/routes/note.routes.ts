import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { NoteController } from '../controllers/note.controller';
import { requireGitHub } from '../middleware/auth';
import { listNotesSchema, createNoteSchema } from '../schemas/note.schema';

export async function noteRoutes(app: FastifyInstance) {
  // Use Zod Type Provider
  const router = app.withTypeProvider<ZodTypeProvider>();

  // List Notes
  router.get('/', {
    preHandler: [requireGitHub],
    schema: {
      tags: ['Notes'],
      querystring: listNotesSchema,
    }
  }, NoteController.listNotes);

  // Sync Notes
  router.post('/sync', {
    preHandler: [requireGitHub],
    schema: {
        tags: ['Notes'],
        response: {
            200: z.object({
                success: z.boolean(),
                message: z.string()
            })
        }
    }
  }, NoteController.syncNotes);
  
  // Create Note
  router.post('/', {
      preHandler: [requireGitHub],
      schema: {
          tags: ['Notes'],
          body: createNoteSchema
      }
  }, NoteController.createNote);
}
