import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { clientApi } from '../api';
import type {
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '../schemas/client.schema';

export const CLIENTS_QUERY_KEY = ['clients'] as const;

export const useClientList = () =>
  useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => clientApi.getList(),
    staleTime: 60_000,
  });

export const useClient = (id: string) =>
  useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, id],
    queryFn: () => clientApi.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientRequest) => clientApi.create(payload),
    onSuccess: (client) => {
      queryClient.setQueryData<ClientListResponse>(CLIENTS_QUERY_KEY, (previous) => {
        const items = [...(previous?.items ?? []), client].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        return { items, total: items.length };
      });
      message.success('Client created');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientRequest }) =>
      clientApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      message.success('Client updated');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      message.success('Client deleted');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete client');
    },
  });
};
