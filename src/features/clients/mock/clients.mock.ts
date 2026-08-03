import { mockDelay } from '@/shared/mock/mockDelay';
import type {
  Client,
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '../schemas/client.schema';
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

export const mockUpdateClient = async (
  id: string,
  payload: UpdateClientRequest,
): Promise<Client> => {
  await mockDelay();
  const name = payload.name.trim();
  const store = getMockClientsStore();
  const index = store.findIndex((client) => client.id === id);
  if (index < 0) {
    throw new Error('Client not found');
  }

  const duplicate = store.some(
    (client) => client.id !== id && client.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('Client name already exists');
  }

  const updated: Client = { ...store[index], name };
  const next = [...store];
  next[index] = updated;
  setMockClientsStore(next);
  return updated;
};

export const mockDeleteClient = async (id: string): Promise<void> => {
  await mockDelay();
  const store = getMockClientsStore();
  const exists = store.some((client) => client.id === id);
  if (!exists) {
    throw new Error('Client not found');
  }
  setMockClientsStore(store.filter((client) => client.id !== id));
};
