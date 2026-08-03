import dayjs from 'dayjs';
import { URGENCY_STYLES } from '@/shared/constants/urgencyStyles';
import { TRACKER_BLOCK_LEGEND } from '@/shared/constants/taskConfirmation';
import type { TrackerUrgency } from './types';

export { TRACKER_BLOCK_LEGEND };

export const TRACKER_DAY_WIDTH = 28;
export const TRACKER_ROW_HEIGHT = 48;
export const TRACKER_BLOCK_HEIGHT = 18;
export const TRACKER_BLOCK_GAP = 2;
export const TRACKER_BLOCK_PADDING = 5;
export const TRACKER_OFF_ROW_HEIGHT = 36;
export const TRACKER_CAL_HEADER_HEIGHT = 108; // 28 + 22 + 22 + 36

/** Admin-only calendar day zoom. `fit` fills the panel; others enforce a wider day column. */
export const TRACKER_ADMIN_DAY_ZOOM = {
  fit: 'fit',
  comfortable: 'comfortable',
  wide: 'wide',
} as const;

export type TrackerAdminDayZoom =
  (typeof TRACKER_ADMIN_DAY_ZOOM)[keyof typeof TRACKER_ADMIN_DAY_ZOOM];

export const TRACKER_ADMIN_DAY_ZOOM_WIDTH: Record<TrackerAdminDayZoom, number | null> = {
  fit: null,
  comfortable: 52,
  wide: 72,
};

export const TRACKER_ADMIN_DAY_ZOOM_OPTIONS: ReadonlyArray<{
  value: TrackerAdminDayZoom;
  label: string;
}> = [
  { value: TRACKER_ADMIN_DAY_ZOOM.fit, label: 'Vừa' },
  { value: TRACKER_ADMIN_DAY_ZOOM.comfortable, label: 'Rộng' },
  { value: TRACKER_ADMIN_DAY_ZOOM.wide, label: 'Rộng hơn' },
];

/** Default Admin zoom so aggregated task labels are readable without manual tuning. */
export const TRACKER_ADMIN_DAY_ZOOM_DEFAULT: TrackerAdminDayZoom =
  TRACKER_ADMIN_DAY_ZOOM.comfortable;

export const TRACKER_LEFT_COLS = {
  name: 192,
  team: 122,
  slides: 66,
} as const;

export const TRACKER_LEFT_WIDTH =
  TRACKER_LEFT_COLS.name + TRACKER_LEFT_COLS.team + TRACKER_LEFT_COLS.slides;

export const TRACKER_RANGE_START = '2026-05-01';
export const TRACKER_RANGE_END = '2026-12-31';

/** Days before today shown at the left edge when the tracker first opens. */
export const TRACKER_INITIAL_LOOKBACK_DAYS = 2;

/** Today column on the calendar — uses real date, clamped to tracker range. */
export const TRACKER_TODAY = (() => {
  const today = dayjs().startOf('day');
  const rangeStart = dayjs(TRACKER_RANGE_START).startOf('day');
  const rangeEnd = dayjs(TRACKER_RANGE_END).startOf('day');

  if (today.isBefore(rangeStart)) return TRACKER_RANGE_START;
  if (today.isAfter(rangeEnd)) return TRACKER_RANGE_END;
  return today.format('YYYY-MM-DD');
})();

/** Sunday-first labels (matches Figma PT_DOW) */
export const TRACKER_DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const TRACKER_URGENCY_STYLES: Record<
  TrackerUrgency,
  { border: string; dot: string; label: string }
> = {
  red: URGENCY_STYLES.red,
  orange: URGENCY_STYLES.orange,
  green: URGENCY_STYLES.green,
  gray: URGENCY_STYLES.gray,
};

export const TRACKER_URGENCY_LEGEND: ReadonlyArray<{
  key: TrackerUrgency;
  label: string;
}> = [
  { key: 'red', label: TRACKER_URGENCY_STYLES.red.label },
  { key: 'orange', label: TRACKER_URGENCY_STYLES.orange.label },
  { key: 'green', label: TRACKER_URGENCY_STYLES.green.label },
  { key: 'gray', label: TRACKER_URGENCY_STYLES.gray.label },
];
