import type { Notification, NotificationListResponse } from '../schemas/notification.schema';

/**
 * Apply a single mark-read to a list cache entry.
 *
 * `adjustUnreadCount` should be true for the optimistic/local first apply only.
 * SSE may already have set the absolute unreadCount before the HTTP onSuccess runs;
 * a second decrement there would under-count (e.g. 6 → 4 instead of 5).
 */
export const applyMarkReadToList = (
  previous: NotificationListResponse,
  updated: Pick<Notification, 'id'>,
  options?: { adjustUnreadCount?: boolean },
): NotificationListResponse => {
  const adjustUnreadCount = options?.adjustUnreadCount ?? true;
  const wasUnread = previous.items.some((item) => item.id === updated.id && !item.isRead);
  return {
    ...previous,
    items: previous.items.map((item) =>
      item.id === updated.id ? { ...item, isRead: true } : item,
    ),
    unreadCount:
      adjustUnreadCount && wasUnread ? Math.max(0, previous.unreadCount - 1) : previous.unreadCount,
  };
};

export const applyMarkAllReadToList = (
  previous: NotificationListResponse,
): NotificationListResponse => ({
  ...previous,
  items: previous.items.map((item) => ({ ...item, isRead: true })),
  unreadCount: 0,
});
