import { mockDelay } from '@/shared/mock/mockDelay';
import type { Client, ClientListResponse, CreateClientRequest } from '../schemas/client.schema';
import { getMockClientsStore, setMockClientsStore } from './clients.data';

export const mockGetClientList = async (): Promise<ClientListResponse> => {
  await mockDelay();
  const items = [...getMockClientsStore()].sort((a, b) => a.name.localeCompare(b.name));
  return { items, total: items.length };
};

export const mockCreateClient = async (payload: CreateClientRequest): Promise<Client> => {
  await mockDelay();
  const name = payload.name.trim();
  const existing = getMockClientsStore().find(
    (client) => client.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) {
    throw new Error('Client name already exists');
  }

  const created: Client = {
    id: `cli-${crypto.randomUUID().slice(0, 8)}`,
    name,
  };
  setMockClientsStore([...getMockClientsStore(), created]);
  return created;
};
