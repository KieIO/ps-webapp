import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axios from 'axios';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { notificationApi } from '../api';
import type { Notification, NotificationListResponse } from '../schemas/notification.schema';
import { applyMarkAllReadToList, applyMarkReadToList } from '../utils/notificationListCache';

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

type MarkReadCacheSnapshot = Array<
  readonly [readonly unknown[], NotificationListResponse | undefined]
>;

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onMutate: async (id) => {
      const scopeKey = userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY;
      await queryClient.cancelQueries({ queryKey: scopeKey });

      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: scopeKey,
      }) as MarkReadCacheSnapshot;

      // Optimistic: bump badge immediately. SSE may also set absolute unreadCount;
      // onSuccess must not decrement again or we under-count (6→4).
      patchNotificationCaches(
        queryClient,
        (cache) => applyMarkReadToList(cache, { id }, { adjustUnreadCount: true }),
        userId,
      );

      return { previous };
    },
    onSuccess: (updated) => {
      patchNotificationCaches(
        queryClient,
        (cache) => applyMarkReadToList(cache, updated, { adjustUnreadCount: false }),
        userId,
      );
    },
    onError: (error: unknown, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
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
    onMutate: async () => {
      const scopeKey = userId ? [...NOTIFICATIONS_QUERY_KEY, userId] : NOTIFICATIONS_QUERY_KEY;
      await queryClient.cancelQueries({ queryKey: scopeKey });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: scopeKey,
      }) as MarkReadCacheSnapshot;
      patchNotificationCaches(queryClient, applyMarkAllReadToList, userId);
      return { previous };
    },
    onSuccess: () => {
      patchNotificationCaches(queryClient, applyMarkAllReadToList, userId);
      message.success('Đã đánh dấu tất cả là đã đọc');
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
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
