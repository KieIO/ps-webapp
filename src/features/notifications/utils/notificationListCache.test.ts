import { describe, expect, it } from 'vitest';
import type { Notification, NotificationListResponse } from '../schemas/notification.schema';
import { applyMarkAllReadToList, applyMarkReadToList } from './notificationListCache';

const item = (id: string, isRead = false): Notification => ({
  id,
  type: 'task_creative_cm',
  title: 'Có task mới cần assign Staff',
  body: 'test',
  refType: 'task',
  refId: id,
  isRead,
  createdAt: '2026-10-01T00:00:00Z',
});

const list = (unreadCount: number, items: Notification[]): NotificationListResponse => ({
  items,
  total: items.length,
  unreadCount,
});

describe('applyMarkReadToList', () => {
  it('decrements unread once when adjusting (optimistic path)', () => {
    const previous = list(6, [item('a'), item('b'), item('c')]);
    const next = applyMarkReadToList(previous, { id: 'a' }, { adjustUnreadCount: true });
    expect(next.unreadCount).toBe(5);
    expect(next.items.find((i) => i.id === 'a')?.isRead).toBe(true);
  });

  it('does not double-decrement after SSE already applied the absolute count', () => {
    // Server/SSE raced ahead: unreadCount already 5, but list item still unread.
    const afterSse = list(5, [item('a'), item('b'), item('c')]);
    const afterHttpSuccess = applyMarkReadToList(
      afterSse,
      { id: 'a' },
      { adjustUnreadCount: false },
    );
    expect(afterHttpSuccess.unreadCount).toBe(5);
    expect(afterHttpSuccess.items.find((i) => i.id === 'a')?.isRead).toBe(true);
  });

  it('old adjust-on-success path would under-count after SSE (regression guard)', () => {
    const afterSse = list(5, [item('a'), item('b'), item('c')]);
    const buggy = applyMarkReadToList(afterSse, { id: 'a' }, { adjustUnreadCount: true });
    expect(buggy.unreadCount).toBe(4);
  });

  it('is a no-op on unreadCount when item already read', () => {
    const previous = list(5, [item('a', true), item('b')]);
    const next = applyMarkReadToList(previous, { id: 'a' }, { adjustUnreadCount: true });
    expect(next.unreadCount).toBe(5);
  });
});

describe('applyMarkAllReadToList', () => {
  it('clears unread and marks every item', () => {
    const previous = list(3, [item('a'), item('b')]);
    expect(applyMarkAllReadToList(previous)).toEqual({
      items: [item('a', true), item('b', true)],
      total: 2,
      unreadCount: 0,
    });
  });
});
