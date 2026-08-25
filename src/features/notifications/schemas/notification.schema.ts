/**
 * Zod schemas for Notifications API.
 */
import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'task_reminder',
  'task_assigned',
  'task_creative_handoff',
  'task_creative_cm',
  'project_assigned',
  'deadline_warning',
  'overload',
  'ot_pending',
  'ot_approved',
  'ot_rejected',
  'ot_task_assigned',
  'ot_awaiting_review',
  'ot_result_rejected',
  'ot_summary_ready',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_REF_TYPES = ['task', 'project', 'overtime'] as const;

export type NotificationRefType = (typeof NOTIFICATION_REF_TYPES)[number];

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  refType: z.string().optional(),
  refId: z.string().nullish(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const NotificationListResponseSchema = z.object({
  items: z.array(NotificationSchema),
  total: z.number(),
  unreadCount: z.number(),
});

export const MarkAllReadResponseSchema = z.object({
  updatedCount: z.number(),
});

export const StreamCreatedPayloadSchema = NotificationSchema.extend({
  unreadCount: z.number(),
});

export const StreamUnreadPayloadSchema = z.object({
  unreadCount: z.number(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;
export type MarkAllReadResponse = z.infer<typeof MarkAllReadResponseSchema>;
