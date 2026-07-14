import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { notificationApi } from '../api';
import type { Notification, NotificationListResponse } from '../schemas/notification.schema';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

/** Scoped by user so caches never leak across login sessions. */
export const notificationListKey = (userId: string, limit?: number) =>
  [...NOTIFICATIONS_QUERY_KEY, userId, 'list', limit ?? 'default'] as const;

export const useNotificationList = (limit?: number, options?: { enabled?: boolean }) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useQuery({
    queryKey: notificationListKey(userId ?? 'anonymous', limit),
    queryFn: () => notificationApi.getList(limit),
    staleTime: 15_000,
    enabled: Boolean(userId) && (options?.enabled ?? true),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: (updated) => {
      patchNotificationCaches(
        queryClient,
        (previous) => {
          const wasUnread = previous.items.some((item) => item.id === updated.id && !item.isRead);
          const items = previous.items.map((item) =>
            item.id === updated.id ? { ...item, isRead: true } : item,
          );
          return {
            ...previous,
            items,
            unreadCount: wasUnread ? Math.max(0, previous.unreadCount - 1) : previous.unreadCount,
          };
        },
        userId,
      );
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        message.error(
          (error.response?.data as { message?: string } | undefined)?.message ||
            'Không đánh dấu đã đọc được',
        );
        return;
      }
      message.error('Không đánh dấu đã đọc được');
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      patchNotificationCaches(
        queryClient,
        (previous) => ({
          ...previous,
          items: previous.items.map((item) => ({ ...item, isRead: true })),
          unreadCount: 0,
        }),
        userId,
      );
      message.success('Đã đánh dấu tất cả là đã đọc');
    },
    onError: () => {
      message.error('Không đánh dấu tất cả được');
    },
  });
};

export const invalidateNotificationQueries = (queryClient: QueryClient, userId?: string) => {
  void queryClient.invalidateQueries({
    queryKey: userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY,
  });
};

export const applyUnreadCountToCaches = (
  queryClient: QueryClient,
  unreadCount: number,
  userId?: string,
) => {
  const entries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY,
  });

  let patched = 0;
  for (const [key, data] of entries) {
    if (!data) continue;
    queryClient.setQueryData(key, { ...data, unreadCount });
    patched += 1;
  }

  if (patched === 0 && userId) {
    queryClient.setQueryData<NotificationListResponse>(notificationListKey(userId, 8), {
      items: [],
      total: 0,
      unreadCount,
    });
  }
};

export const prependNotificationToCaches = (
  queryClient: QueryClient,
  notification: Notification,
  unreadCount: number,
  userId?: string,
) => {
  const entries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY,
  });

  let patched = 0;
  for (const [key, data] of entries) {
    if (!data) continue;
    const limit = limitFromQueryKey(key);
    const withoutDup = data.items.filter((item) => item.id !== notification.id);
    const items = [notification, ...withoutDup];
    queryClient.setQueryData<NotificationListResponse>(key, {
      items: limit > 0 ? items.slice(0, limit) : items,
      total: data.total + (withoutDup.length === data.items.length ? 1 : 0),
      unreadCount,
    });
    patched += 1;
  }

  // Race: SSE can arrive before the first list query settles — seed a bell cache.
  if (patched === 0 && userId) {
    queryClient.setQueryData<NotificationListResponse>(notificationListKey(userId, 8), {
      items: [notification],
      total: 1,
      unreadCount,
    });
  }
};

const limitFromQueryKey = (key: readonly unknown[]): number => {
  const last = key[key.length - 1];
  if (typeof last === 'number' && Number.isFinite(last) && last > 0) return last;
  if (typeof last === 'string' && last !== 'default') {
    const parsed = Number(last);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
};

const patchNotificationCaches = (
  queryClient: QueryClient,
  updater: (previous: NotificationListResponse) => NotificationListResponse,
  userId?: string,
) => {
  const entries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY,
  });
  for (const [key, data] of entries) {
    if (!data) continue;
    queryClient.setQueryData(key, updater(data));
  }
};
