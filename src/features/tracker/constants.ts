import dayjs from 'dayjs';
import { URGENCY_STYLES } from '@/shared/constants/urgencyStyles';
import {
  TRACKER_BLOCK_LEGEND,
  TRACKER_PROJECT_STATUS_LEGEND,
} from '@/shared/constants/taskConfirmation';
import type { TrackerUrgency } from './types';

export { TRACKER_BLOCK_LEGEND, TRACKER_PROJECT_STATUS_LEGEND };

export const TRACKER_DAY_WIDTH = 28;
export const TRACKER_ROW_HEIGHT = 48;
export const TRACKER_BLOCK_HEIGHT = 18;
export const TRACKER_BLOCK_GAP = 2;
export const TRACKER_BLOCK_PADDING = 5;
export const TRACKER_OFF_ROW_HEIGHT = 36;
export const TRACKER_CAPACITY_ROW_HEIGHT = 40;
/** Month + DOW + date + off-day rows (no remaining-output). */
export const TRACKER_CAL_HEADER_HEIGHT_BASE = 108; // 28 + 22 + 22 + 36
export const TRACKER_CAL_HEADER_HEIGHT =
  TRACKER_CAL_HEADER_HEIGHT_BASE + TRACKER_CAPACITY_ROW_HEIGHT;

export const getTrackerCalHeaderHeight = (showRemainingOutput: boolean): number =>
  showRemainingOutput ? TRACKER_CAL_HEADER_HEIGHT : TRACKER_CAL_HEADER_HEIGHT_BASE;

/** Calendar day zoom for all roles. `fit` fills the panel; others enforce a wider day column. */
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

/** Default zoom so task labels are readable without manual tuning. */
export const TRACKER_ADMIN_DAY_ZOOM_DEFAULT: TrackerAdminDayZoom = TRACKER_ADMIN_DAY_ZOOM.wide;

export const TRACKER_LEFT_COLS = {
  name: 192,
  team: 122,
  slides: 88,
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
  green: URGENCY_STYLES.green,
  orange: URGENCY_STYLES.orange,
  red: URGENCY_STYLES.red,
  purple: URGENCY_STYLES.purple,
  yellow: URGENCY_STYLES.yellow,
  cyan: URGENCY_STYLES.cyan,
  gray: URGENCY_STYLES.gray,
};

/** Legend order matches the product urgency table. */
export const TRACKER_URGENCY_LEGEND: ReadonlyArray<{
  key: TrackerUrgency;
  label: string;
}> = [
  { key: 'green', label: TRACKER_URGENCY_STYLES.green.label },
  { key: 'orange', label: TRACKER_URGENCY_STYLES.orange.label },
  { key: 'red', label: TRACKER_URGENCY_STYLES.red.label },
  { key: 'purple', label: TRACKER_URGENCY_STYLES.purple.label },
  { key: 'yellow', label: TRACKER_URGENCY_STYLES.yellow.label },
  { key: 'cyan', label: TRACKER_URGENCY_STYLES.cyan.label },
  { key: 'gray', label: TRACKER_URGENCY_STYLES.gray.label },
];
