import dayjs from 'dayjs';
import type { MilestoneUnit, ProjectMilestoneInput } from '../schemas/milestone.schema';

export type MilestoneValidationContext = {
  startDate: string;
  endDate: string;
  /** Task-derived project slide total. When 0, slides-sum check is skipped. */
  totalSlides: number;
};

export type MilestoneValidationResult = { ok: true } | { ok: false; message: string };

const toDay = (value: string) => dayjs(value).startOf('day');

export const sumMilestoneQuantityByUnit = (
  milestones: readonly Pick<ProjectMilestoneInput, 'quantity' | 'unit'>[],
  unit: MilestoneUnit,
): number => milestones.reduce((sum, item) => (item.unit === unit ? sum + item.quantity : sum), 0);

/**
 * Hard rules:
 * - deadline must fall within [startDate, endDate] (inclusive, by calendar day)
 * - when totalSlides > 0, sum of slides milestones must be ≤ totalSlides
 */
export const validateMilestones = (
  milestones: readonly ProjectMilestoneInput[],
  ctx: MilestoneValidationContext,
): MilestoneValidationResult => {
  const start = toDay(ctx.startDate);
  const end = toDay(ctx.endDate);

  if (!start.isValid() || !end.isValid()) {
    return { ok: false, message: 'Ngày bắt đầu / kết thúc dự án không hợp lệ' };
  }

  for (const milestone of milestones) {
    const name = milestone.name?.trim() ?? '';
    if (!name) {
      return { ok: false, message: 'Tên mốc là bắt buộc' };
    }
    if (!milestone.quantity || milestone.quantity <= 0) {
      return { ok: false, message: `Mốc "${name}": khối lượng phải lớn hơn 0` };
    }
    const deadline = toDay(milestone.deadlineDate);
    if (!deadline.isValid()) {
      return { ok: false, message: `Mốc "${name}": ngày deadline không hợp lệ` };
    }
    if (deadline.isBefore(start, 'day') || deadline.isAfter(end, 'day')) {
      return {
        ok: false,
        message: `Mốc "${name}": deadline phải nằm trong thời gian dự án`,
      };
    }
  }

  if (ctx.totalSlides > 0) {
    const slidesSum = sumMilestoneQuantityByUnit(milestones, 'slides');
    if (slidesSum > ctx.totalSlides) {
      return {
        ok: false,
        message: `Tổng slides các mốc (${slidesSum}) vượt totalSlides của dự án (${ctx.totalSlides})`,
      };
    }
  }

  return { ok: true };
};

/** Normalize any date string to YYYY-MM-DD for tracker day columns. */
export const toMilestoneDateKey = (value: string): string => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value.slice(0, 10);
};
