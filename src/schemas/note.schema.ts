import { z } from 'zod';

export const listNotesSchema = z.object({
  state: z.enum(['open', 'closed', 'all']).optional(),
  label: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(100).default(20),
});

export type ListNotesQuery = z.infer<typeof listNotesSchema>;

export const createNoteSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export type CreateNoteBody = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  state: z.enum(['open', 'closed']).optional(),
  labels: z.array(z.string()).optional(),
});

export type UpdateNoteBody = z.infer<typeof updateNoteSchema>;
