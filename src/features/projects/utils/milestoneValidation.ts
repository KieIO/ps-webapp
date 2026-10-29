import dayjs from 'dayjs';
import { isSlidesOrDaUnit, type ProjectMilestoneInput } from '../schemas/milestone.schema';

export type MilestoneValidationContext = {
  startDate: string;
  endDate: string;
};

export type MilestoneValidationResult = { ok: true } | { ok: false; message: string };

const toDay = (value: string) => dayjs(value).startOf('day');

/**
 * Hard rules:
 * - deadline must fall within [startDate, endDate] unless outsideTimeline is set
 * - volume: unit slides|da requires quantity > 0; empty unit allows null quantity
 * - milestone slide totals are not capped by the project's totalSlides
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

    const unit = milestone.unit ?? '';
    if (unit !== '' && unit !== 'slides' && unit !== 'da' && unit !== 'others') {
      return {
        ok: false,
        message: `Mốc "${name}": đơn vị phải là Others, Slides, DA hoặc trống`,
      };
    }
    if (isSlidesOrDaUnit(unit) || (unit === 'others' && milestone.quantity != null)) {
      if (milestone.quantity == null || milestone.quantity <= 0) {
        return { ok: false, message: `Mốc "${name}": khối lượng phải lớn hơn 0` };
      }
      if (!Number.isInteger(milestone.quantity)) {
        return { ok: false, message: `Mốc "${name}": khối lượng phải là số nguyên` };
      }
    } else if (milestone.quantity != null && milestone.quantity < 0) {
      return { ok: false, message: `Mốc "${name}": khối lượng không được âm` };
    }

    const deadline = toDay(milestone.deadlineDate);
    if (!deadline.isValid()) {
      return { ok: false, message: `Mốc "${name}": ngày deadline không hợp lệ` };
    }
    if (
      !milestone.outsideTimeline &&
      (deadline.isBefore(start, 'day') || deadline.isAfter(end, 'day'))
    ) {
      return {
        ok: false,
        message: `Mốc "${name}": deadline phải nằm trong thời gian dự án`,
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

/**
 * Map UI milestones to replace-all / project-save payload (BE contract).
 * - `quantity: number | null`
 * - `unit: "slides" | "da" | ""`
 * - `completed: boolean`
 * Keeps `id` when present (BE hard-deletes before insert).
 */
export const toReplaceMilestonePayload = (
  milestones: readonly ProjectMilestoneInput[],
): ProjectMilestoneInput[] =>
  milestones.map((item) => {
    const unit =
      item.unit === 'slides' || item.unit === 'da' || item.unit === 'others' ? item.unit : '';
    const payload: ProjectMilestoneInput = {
      name: item.name.trim(),
      deadlineDate: toMilestoneDateKey(item.deadlineDate),
      outsideTimeline: Boolean(item.outsideTimeline),
      quantity: unit ? (item.quantity ?? null) : null,
      unit,
      note: item.note?.trim() ?? '',
      completed: Boolean(item.completed),
    };
    if (item.id?.trim()) {
      payload.id = item.id.trim();
    }
    return payload;
  });
