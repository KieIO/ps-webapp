import type { LeaveRecord } from '@/features/leave/schemas/leave.schema';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** First 10 chars when value is YYYY-MM-DD or an ISO datetime. */
export function calendarDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value.trim().slice(0, 10);
  return ISO_DATE.test(key) ? key : null;
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

export type LeaveWindowHit = {
  startDate: string;
  endDate: string;
  status: LeaveRecord['status'];
};

/**
 * Open leave (scheduled | active) overlapping [windowStart, windowEnd] inclusive.
 * Returns the earliest-starting hit for stable UI copy.
 */
export function findLeaveOverlappingWindow(
  leaves: readonly Pick<LeaveRecord, 'startDate' | 'endDate' | 'status'>[],
  windowStart: string,
  windowEnd: string,
): LeaveWindowHit | null {
  const start = calendarDateKey(windowStart);
  const end = calendarDateKey(windowEnd);
  if (!start || !end) return null;
  const lo = start <= end ? start : end;
  const hi = start <= end ? end : start;

  const hits: LeaveWindowHit[] = [];
  for (const leave of leaves) {
    if (leave.status !== 'scheduled' && leave.status !== 'active') continue;
    const leaveStart = calendarDateKey(leave.startDate);
    const leaveEnd = calendarDateKey(leave.endDate);
    if (!leaveStart || !leaveEnd) continue;
    if (!rangesOverlap(leaveStart, leaveEnd, lo, hi)) continue;
    hits.push({
      startDate: leaveStart,
      endDate: leaveEnd,
      status: leave.status,
    });
  }
  if (hits.length === 0) return null;
  hits.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return hits[0] ?? null;
}

export function formatLeaveRangeLabel(hit: LeaveWindowHit): string {
  if (hit.startDate === hit.endDate) {
    return hit.startDate;
  }
  return `${hit.startDate} → ${hit.endDate}`;
}

export const WHOLE_ASSIGN_LEAVE_CONFLICT_TITLE =
  'Người nhận có ngày nghỉ trong khoảng tới deadline';

export const WHOLE_ASSIGN_LEAVE_CONFLICT_HINT =
  'Không giao nguyên được. Hãy chuyển sang Chia nhỏ, chỉnh số lượng từng phần và giao thêm người khác nếu cần.';

export const WHOLE_ASSIGN_LEAVE_SWITCH_SPLIT_LABEL = 'Chuyển sang Chia nhỏ';
