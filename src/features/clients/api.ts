/**
 * Clients API client.
 */
import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import { mockCreateClient, mockGetClientList } from './mock/clients.mock';
import {
  ClientListResponseSchema,
  ClientSchema,
  CreateClientRequestSchema,
  type Client,
  type ClientListResponse,
  type CreateClientRequest,
} from './schemas/client.schema';

export const clientApi = {
  getList: async (): Promise<ClientListResponse> => {
    if (env.useProjectsMock) {
      return ClientListResponseSchema.parse(await mockGetClientList());
    }

    const response = await api.get('/clients');
    return ClientListResponseSchema.parse(response.data);
  },

  create: async (payload: CreateClientRequest): Promise<Client> => {
    const data = CreateClientRequestSchema.parse(payload);

    if (env.useProjectsMock) {
      return ClientSchema.parse(await mockCreateClient(data));
    }

    const response = await api.post('/clients', data);
    return ClientSchema.parse(response.data);
  },
};
