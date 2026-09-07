import dayjs from 'dayjs';
import type {
  RemainingOutputFilters,
  RemainingOutputResponse,
} from '../schemas/remainingOutput.schema';

/** Deterministic mock for tracker remaining-capacity row when capacity mock is on. */
export const mockGetRemainingOutput = async (
  filters: RemainingOutputFilters,
): Promise<RemainingOutputResponse> => {
  const start = dayjs(filters.startDate);
  const end = dayjs(filters.endDate);
  const days: RemainingOutputResponse['days'] = [];

  for (let cursor = start; !cursor.isAfter(end, 'day'); cursor = cursor.add(1, 'day')) {
    const dayOfMonth = cursor.date();
    const isWeekend = cursor.day() === 0 || cursor.day() === 6;
    days.push({
      date: cursor.format('YYYY-MM-DD'),
      isWeekend,
      projectRemainingSlides: isWeekend
        ? Math.max(0, 40 - dayOfMonth)
        : Math.max(0, 80 - dayOfMonth * 2),
      creativeRemainingDA: isWeekend ? 0 : Math.max(0, 6 - Math.floor(dayOfMonth / 6)),
    });
  }

  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    assumption: {
      slidesTaskLevel: 2,
      slidesPointsPerUnit: 30,
      daTaskLevel: 2,
      daPointsPerUnit: 480,
      note: 'Ước lượng capacity còn lại. Ví dụ: Project ÷ 30đ (Slides L2), Creative ÷ 480đ (DA L2).',
    },
    days,
  };
};
