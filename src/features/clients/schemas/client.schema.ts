/**
 * Zod schemas for Clients API.
 */
import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ClientListResponseSchema = z.object({
  items: z.array(ClientSchema),
  total: z.number(),
});

export const CreateClientRequestSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
});

export type Client = z.infer<typeof ClientSchema>;
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;
export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;
