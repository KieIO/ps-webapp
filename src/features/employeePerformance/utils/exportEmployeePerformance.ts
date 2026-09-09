import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import type { EmployeePerformanceDetail } from '../schemas/employeePerformance.schema';

export const EMPLOYEE_PERFORMANCE_EXPORT_HEADERS = [
  'Nhân viên',
  'Phòng',
  'Tháng',
  'Task code',
  'Tên task',
  'Level',
  'Output',
  'Revision',
  'Quality',
  'Hoàn thành',
  'Đúng hạn',
] as const;

const onTimeLabel = (value: boolean | null): string => {
  if (value == null) return '';
  return value ? 'Đúng hạn' : 'Trễ hạn';
};

const slugifyName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'employee';

export const buildEmployeePerformanceExportRows = (
  detail: EmployeePerformanceDetail,
): (string | number)[][] => {
  const monthKey = `${detail.period.year}-${String(detail.period.month).padStart(2, '0')}`;
  const employee = detail.profile.name;
  const department = detail.profile.displayDepartment || detail.profile.department;

  return detail.recentTasks.map((task) => [
    employee,
    department,
    monthKey,
    task.taskCode,
    task.taskName,
    task.level,
    task.quantity,
    task.revisionCount ?? '',
    task.qualityScore ?? '',
    task.completedAt ? dayjs(task.completedAt).format(DATE_FORMAT) : '',
    onTimeLabel(task.onTime),
  ]);
};

export const exportEmployeePerformanceToCsv = (detail: EmployeePerformanceDetail): void => {
  const monthKey = `${detail.period.year}-${String(detail.period.month).padStart(2, '0')}`;
  const nameSlug = slugifyName(detail.profile.name);

  downloadCsv(
    `employee-performance-${nameSlug}-${monthKey}.csv`,
    [...EMPLOYEE_PERFORMANCE_EXPORT_HEADERS],
    buildEmployeePerformanceExportRows(detail),
  );
};
