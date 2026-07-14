import { useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { openNotificationStream } from '../../api';
import {
  applyUnreadCountToCaches,
  invalidateNotificationQueries,
  prependNotificationToCaches,
} from '../../hooks/useNotifications';
import {
  bindNotificationSoundUnlock,
  playNotificationSound,
} from '../../utils/playNotificationSound';

const BASE_RETRY_MS = 1500;
const MAX_RETRY_MS = 30_000;

/**
 * Keeps one SSE connection per authenticated session and syncs React Query caches.
 * Mount once under AuthenticatedLayout.
 */
export function NotificationStreamProvider({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const queryClient = useQueryClient();
  const retryRef = useRef(BASE_RETRY_MS);

  useEffect(() => {
    if (!isAuthenticated) return;
    return bindNotificationSoundUnlock();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token || !userId) return;

    const abort = new AbortController();
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleReconnect = () => {
      if (disposed || abort.signal.aborted) return;
      const delay = retryRef.current;
      retryRef.current = Math.min(delay * 2, MAX_RETRY_MS);
      retryTimer = setTimeout(() => {
        void connect();
      }, delay);
    };

    const connect = async () => {
      try {
        await openNotificationStream(
          {
            onCreated: (payload) => {
              retryRef.current = BASE_RETRY_MS;
              const { unreadCount, ...notification } = payload;
              prependNotificationToCaches(queryClient, notification, unreadCount, userId);
              playNotificationSound();
            },
            onUnreadCount: (unreadCount) => {
              retryRef.current = BASE_RETRY_MS;
              applyUnreadCountToCaches(queryClient, unreadCount, userId);
            },
          },
          abort.signal,
        );
      } catch {
        if (disposed || abort.signal.aborted) return;
        invalidateNotificationQueries(queryClient, userId);
      }
      scheduleReconnect();
    };

    void connect();

    return () => {
      disposed = true;
      abort.abort();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [isAuthenticated, token, userId, queryClient]);

  return children;
}
