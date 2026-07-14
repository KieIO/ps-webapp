import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import { store } from '@/store/store';
import {
  MarkAllReadResponseSchema,
  NotificationListResponseSchema,
  NotificationSchema,
  type MarkAllReadResponse,
  type Notification,
  type NotificationListResponse,
} from './schemas/notification.schema';

export const notificationApi = {
  getList: async (limit?: number): Promise<NotificationListResponse> => {
    const response = await api.get('/notifications', {
      params: limit != null ? { limit } : undefined,
    });
    return NotificationListResponseSchema.parse(response.data);
  },

  markRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return NotificationSchema.parse(response.data);
  },

  markAllRead: async (): Promise<MarkAllReadResponse> => {
    const response = await api.put('/notifications/read-all');
    return MarkAllReadResponseSchema.parse(response.data);
  },
};

export type NotificationStreamHandlers = {
  onCreated?: (payload: Notification & { unreadCount: number }) => void;
  onUnreadCount?: (unreadCount: number) => void;
  onError?: (error: unknown) => void;
};

/**
 * Fetch-based SSE client (supports Authorization header — EventSource cannot).
 * Reconnect with exponential backoff is handled by the caller / provider.
 */
export const openNotificationStream = (
  handlers: NotificationStreamHandlers,
  signal: AbortSignal,
): Promise<void> => {
  const token = store.getState().auth.token;
  if (!token) {
    return Promise.reject(new Error('Missing auth token'));
  }

  const url = `${env.apiUrl.replace(/\/$/, '')}/notifications/stream`;

  return (async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Notification stream failed (${response.status})`);
    }
    if (!response.body) {
      throw new Error('Notification stream has no body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventName = 'message';
    let dataLines: string[] = [];

    const flushEvent = () => {
      if (dataLines.length === 0) {
        eventName = 'message';
        return;
      }
      const raw = dataLines.join('\n');
      dataLines = [];
      const currentEvent = eventName;
      eventName = 'message';

      try {
        const parsed: unknown = JSON.parse(raw);
        if (currentEvent === 'notification.created') {
          const payload = parsed as Notification & { unreadCount: number };
          handlers.onCreated?.(payload);
        } else if (currentEvent === 'unread_count') {
          const unread = (parsed as { unreadCount?: number }).unreadCount;
          if (typeof unread === 'number') handlers.onUnreadCount?.(unread);
        }
      } catch (error) {
        handlers.onError?.(error);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex = buffer.indexOf('\n');
      while (newlineIndex >= 0) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);

        if (line === '') {
          flushEvent();
        } else if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }

        newlineIndex = buffer.indexOf('\n');
      }
    }
  })();
};
