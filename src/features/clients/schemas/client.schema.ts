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

/** Shared create/update body — rename and create both only accept a name. */
export const ClientNameRequestSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
});

export const CreateClientRequestSchema = ClientNameRequestSchema;
export const UpdateClientRequestSchema = ClientNameRequestSchema;

export type Client = z.infer<typeof ClientSchema>;
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;
export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;
export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;
