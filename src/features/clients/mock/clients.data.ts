import type { Client } from '../schemas/client.schema';

const INITIAL_MOCK_CLIENTS: Client[] = [
  { id: 'cli-ait', name: 'AIT' },
  { id: 'cli-allianz', name: 'ALLIANZ' },
  { id: 'cli-altevia', name: 'ALTEVIA' },
  { id: 'cli-covsignec', name: 'COVSIGNEC' },
  { id: 'cli-eg', name: 'EG' },
  { id: 'cli-everest', name: 'EVEREST' },
  { id: 'cli-internal', name: 'Internal' },
  { id: 'cli-sanofi', name: 'SANOFI' },
];

let store: Client[] = [...INITIAL_MOCK_CLIENTS];

export const getMockClientsStore = (): Client[] => store;

export const setMockClientsStore = (next: Client[]): void => {
  store = next;
};

export const resetMockClientsStore = (): void => {
  store = [...INITIAL_MOCK_CLIENTS];
};
