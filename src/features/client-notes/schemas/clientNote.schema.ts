/**
 * Zod schemas for Client Notes (Client Knowledge) API.
 */
import { z } from 'zod';

export const CLIENT_NOTE_CATEGORIES = [
  'preference',
  'feedback',
  'contact',
  'process',
  'risk',
  'general',
] as const;

export type ClientNoteCategory = (typeof CLIENT_NOTE_CATEGORIES)[number];

export const CLIENT_NOTE_CATEGORY_LABELS: Record<ClientNoteCategory, string> = {
  preference: 'Preference',
  feedback: 'Feedback',
  contact: 'Contact',
  process: 'Process',
  risk: 'Risk',
  general: 'General',
};

export const ClientNoteSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  title: z.string(),
  body: z.string(),
  category: z.enum(CLIENT_NOTE_CATEGORIES),
  relatedProjectId: z.string().nullable().optional(),
  relatedProjectCode: z.string().optional().default(''),
  relatedProjectName: z.string().optional().default(''),
  createdById: z.string(),
  createdByName: z.string(),
  updatedById: z.string(),
  updatedByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClientNoteListResponseSchema = z.object({
  items: z.array(ClientNoteSchema),
  total: z.number(),
});

export const CreateClientNoteRequestSchema = z.object({
  title: z.string().max(255).optional().default(''),
  body: z.string().min(1, 'Body is required'),
  category: z.enum(CLIENT_NOTE_CATEGORIES).optional().default('general'),
  relatedProjectId: z.string().nullable().optional(),
});

export const UpdateClientNoteRequestSchema = z.object({
  title: z.string().max(255).optional(),
  body: z.string().min(1).optional(),
  category: z.enum(CLIENT_NOTE_CATEGORIES).optional(),
  relatedProjectId: z.string().nullable().optional(),
  clearRelated: z.boolean().optional(),
});

export type ClientNote = z.infer<typeof ClientNoteSchema>;
export type ClientNoteListResponse = z.infer<typeof ClientNoteListResponseSchema>;
export type CreateClientNoteRequest = z.infer<typeof CreateClientNoteRequestSchema>;
export type UpdateClientNoteRequest = z.infer<typeof UpdateClientNoteRequestSchema>;
