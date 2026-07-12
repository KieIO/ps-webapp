import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { clientApi } from '../api';
import type { ClientListResponse, CreateClientRequest } from '../schemas/client.schema';

export const CLIENTS_QUERY_KEY = ['clients'] as const;

export const useClientList = () =>
  useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => clientApi.getList(),
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
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const code = (error.response?.data as { code?: string } | undefined)?.code;
        if (code === 'DUPLICATE_CLIENT_NAME' || error.response?.status === 409) {
          message.error('Client name already exists');
          return;
        }
        const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
        message.error(apiMessage || 'Failed to create client');
        return;
      }
      message.error(error instanceof Error ? error.message : 'Failed to create client');
    },
  });
};
