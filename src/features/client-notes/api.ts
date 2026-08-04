/**
 * Client Notes API client.
 */
import api from '@/shared/api/base.api';
import { rethrowApiError } from '@/shared/api/apiError';
import {
  ClientNoteListResponseSchema,
  ClientNoteSchema,
  CreateClientNoteRequestSchema,
  UpdateClientNoteRequestSchema,
  type ClientNote,
  type ClientNoteListResponse,
  type CreateClientNoteRequest,
  type UpdateClientNoteRequest,
} from './schemas/clientNote.schema';

export const clientNoteApi = {
  getList: async (clientId: string): Promise<ClientNoteListResponse> => {
    try {
      const response = await api.get(`/clients/${clientId}/notes`);
      return ClientNoteListResponseSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to load client notes');
    }
  },

  create: async (clientId: string, payload: CreateClientNoteRequest): Promise<ClientNote> => {
    const data = CreateClientNoteRequestSchema.parse(payload);
    try {
      const response = await api.post(`/clients/${clientId}/notes`, data);
      return ClientNoteSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to create client note');
    }
  },

  update: async (
    clientId: string,
    noteId: string,
    payload: UpdateClientNoteRequest,
  ): Promise<ClientNote> => {
    const data = UpdateClientNoteRequestSchema.parse(payload);
    try {
      const response = await api.patch(`/clients/${clientId}/notes/${noteId}`, data);
      return ClientNoteSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to update client note');
    }
  },

  delete: async (clientId: string, noteId: string): Promise<void> => {
    try {
      await api.delete(`/clients/${clientId}/notes/${noteId}`);
    } catch (error) {
      return rethrowApiError(error, 'Failed to delete client note');
    }
  },
};
