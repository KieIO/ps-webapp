import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { clientNoteApi } from '../api';
import type {
  CreateClientNoteRequest,
  UpdateClientNoteRequest,
} from '../schemas/clientNote.schema';

export const clientNotesQueryKey = (clientId: string) => ['clients', clientId, 'notes'] as const;

export const useClientNotes = (clientId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: clientNotesQueryKey(clientId),
    queryFn: () => clientNoteApi.getList(clientId),
    enabled: (options?.enabled ?? true) && Boolean(clientId),
    staleTime: 30_000,
  });

export const useCreateClientNote = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientNoteRequest) => clientNoteApi.create(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientNotesQueryKey(clientId) });
      message.success('Note created');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to create note');
    },
  });
};

export const useUpdateClientNote = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: UpdateClientNoteRequest }) =>
      clientNoteApi.update(clientId, noteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientNotesQueryKey(clientId) });
      message.success('Note updated');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update note');
    },
  });
};

export const useDeleteClientNote = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => clientNoteApi.delete(clientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientNotesQueryKey(clientId) });
      message.success('Note deleted');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to delete note');
    },
  });
};
