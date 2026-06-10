import type { TrackerUrgency } from './types';

export const TRACKER_DAY_WIDTH = 28;
export const TRACKER_ROW_HEIGHT = 48;
export const TRACKER_OFF_ROW_HEIGHT = 36;
export const TRACKER_CAL_HEADER_HEIGHT = 108; // 28 + 22 + 22 + 36

export const TRACKER_LEFT_COLS = {
  name: 192,
  team: 122,
  slides: 66,
} as const;

export const TRACKER_LEFT_WIDTH =
  TRACKER_LEFT_COLS.name + TRACKER_LEFT_COLS.team + TRACKER_LEFT_COLS.slides;

export const TRACKER_RANGE_START = '2026-05-01';
export const TRACKER_RANGE_END = '2026-12-31';

/** Wireframe "today" column — May 27, 2026 */
export const TRACKER_TODAY = '2026-05-27';

/** Sunday-first labels (matches Figma PT_DOW) */
export const TRACKER_DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const TRACKER_URGENCY_STYLES: Record<
  TrackerUrgency,
  { border: string; dot: string; label: string }
> = {
  red: { border: '#DC2626', dot: '#DC2626', label: 'Gấp' },
  orange: { border: '#EA580C', dot: '#EA580C', label: 'Gấp vừa' },
  green: { border: '#16A34A', dot: '#16A34A', label: 'Hoàn tất' },
  gray: { border: '#94A3B8', dot: '#94A3B8', label: 'Bình thường' },
};

export const TRACKER_URGENCY_LEGEND = [
  { color: TRACKER_URGENCY_STYLES.red.dot, label: TRACKER_URGENCY_STYLES.red.label },
  { color: TRACKER_URGENCY_STYLES.orange.dot, label: TRACKER_URGENCY_STYLES.orange.label },
  { color: TRACKER_URGENCY_STYLES.green.dot, label: TRACKER_URGENCY_STYLES.green.label },
  { color: TRACKER_URGENCY_STYLES.gray.dot, label: TRACKER_URGENCY_STYLES.gray.label },
] as const;
