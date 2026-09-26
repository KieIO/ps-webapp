/**
 * Zod schemas for Project Tracker API responses.
 * Backend contract: docs/TRACKER_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import { z } from 'zod';
import { TRACKER_BLOCK_TYPES } from '@/shared/constants/taskConfirmation';

export { TRACKER_BLOCK_TYPES };
export const TRACKER_URGENCIES = [
  'red',
  'orange',
  'yellow',
  'cyan',
  'purple',
  'green',
  'gray',
] as const;
export const TRACKER_URGENCY_SETTINGS = ['auto', ...TRACKER_URGENCIES] as const;

export const TrackerBlockSchema = z.object({
  start: z.string(),
  end: z.string(),
  label: z.string(),
  type: z.enum(TRACKER_BLOCK_TYPES),
  band: z.union([z.literal(0), z.literal(1)]).optional(),
  /** Task quantity (slides/DA). Summed when admin aggregates same-day same-name blocks. */
  quantity: z.number().optional(),
});

export const TrackerProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  pm: z.string(),
  /** Creative Manager names from tasks.creative_manager_id on the project. */
  cm: z.array(z.string()).optional().default([]),
  team: z.array(z.string()),
  totalSlides: z.number().int().min(0),
  highlightSlides: z.boolean().optional(),
  urgency: z.enum(TRACKER_URGENCIES),
  /** Stored urgency setting (includes `auto`). Falls back to resolved urgency for older payloads. */
  urgencySetting: z.enum(TRACKER_URGENCY_SETTINGS).optional(),
  blocks: z.array(TrackerBlockSchema),
});

export const TrackerOffPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const TrackerOffDaySchema = z.object({
  /** Calendar day (YYYY-MM-DD) within a leave start..end span. */
  date: z.string(),
  /** Staff on leave that day (preferred — includes user id for profile links). */
  people: z.array(TrackerOffPersonSchema).optional().default([]),
  /** Display names — kept for older payloads; prefer `people` when present. */
  names: z.array(z.string()).optional().default([]),
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
