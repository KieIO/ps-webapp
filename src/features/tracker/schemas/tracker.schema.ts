/**
 * Zod schemas for Project Tracker API responses.
 * Backend contract: docs/TRACKER_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import { z } from 'zod';

export const TRACKER_BLOCK_TYPES = ['active', 'pending', 'completed'] as const;
export const TRACKER_URGENCIES = ['red', 'orange', 'green', 'gray'] as const;

export const TrackerBlockSchema = z.object({
  start: z.string(),
  end: z.string(),
  label: z.string(),
  type: z.enum(TRACKER_BLOCK_TYPES),
  band: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const TrackerProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  pm: z.string(),
  team: z.array(z.string()),
  totalSlides: z.number().int().min(0),
  highlightSlides: z.boolean().optional(),
  urgency: z.enum(TRACKER_URGENCIES),
  blocks: z.array(TrackerBlockSchema),
});

export const TrackerOffDaySchema = z.object({
  date: z.string(),
  names: z.array(z.string()),
});

export const TrackerResponseSchema = z.object({
  projects: z.array(TrackerProjectSchema),
  offDays: z.array(TrackerOffDaySchema),
});

export type TrackerBlock = z.infer<typeof TrackerBlockSchema>;
export type TrackerProject = z.infer<typeof TrackerProjectSchema>;
export type TrackerOffDay = z.infer<typeof TrackerOffDaySchema>;
export type TrackerUrgency = TrackerProject['urgency'];
export type TrackerResponse = z.infer<typeof TrackerResponseSchema>;
