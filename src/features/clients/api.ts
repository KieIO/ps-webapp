/**
 * Clients API client.
 */
import api from '@/shared/api/base.api';
import { rethrowApiError } from '@/shared/api/apiError';
import { env } from '@/config/env';
import {
  mockCreateClient,
  mockDeleteClient,
  mockGetClientList,
  mockUpdateClient,
} from './mock/clients.mock';
import {
  ClientListResponseSchema,
  ClientSchema,
  CreateClientRequestSchema,
  UpdateClientRequestSchema,
  type Client,
  type ClientListResponse,
  type CreateClientRequest,
  type UpdateClientRequest,
} from './schemas/client.schema';

export const clientApi = {
  getList: async (): Promise<ClientListResponse> => {
    if (env.useProjectsMock) {
      return ClientListResponseSchema.parse(await mockGetClientList());
    }

    try {
      const response = await api.get('/clients');
      return ClientListResponseSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to load clients');
    }
  },

  create: async (payload: CreateClientRequest): Promise<Client> => {
    const data = CreateClientRequestSchema.parse(payload);

    if (env.useProjectsMock) {
      return ClientSchema.parse(await mockCreateClient(data));
    }

    try {
      const response = await api.post('/clients', data);
      return ClientSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to create client');
    }
  },

  update: async (id: string, payload: UpdateClientRequest): Promise<Client> => {
    const data = UpdateClientRequestSchema.parse(payload);

    if (env.useProjectsMock) {
      return ClientSchema.parse(await mockUpdateClient(id, data));
    }

    try {
      const response = await api.patch(`/clients/${id}`, data);
      return ClientSchema.parse(response.data);
    } catch (error) {
      return rethrowApiError(error, 'Failed to update client');
    }
  },

  delete: async (id: string): Promise<void> => {
    if (env.useProjectsMock) {
      await mockDeleteClient(id);
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      return rethrowApiError(error, 'Failed to delete client');
    }
  },
};
