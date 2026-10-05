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
      slidesTaskLevel: 3,
      slidesPointsPerUnit: 45,
      daTaskLevel: 2,
      daPointsPerUnit: 480,
      note: 'Dòng Còn lại / ngày ước lượng khối lượng còn làm được trong ngày theo Điểm task CM của nhân viên đang active (không dùng Capacity/ngày đầy đủ). Phòng Project: điểm còn lại ÷ 45 = slides (Slides level 3). Phòng Creative: điểm còn lại ÷ 480 = DA (DA level 2).',
    },
    days,
  };
};
