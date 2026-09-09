import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_SHORT_FORMAT } from '@/config/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import { formatOtReasonCategories, OT_STATUS_LABELS } from '../constants';
import type { OvertimeRecord } from '../schemas/overtime.schema';

const personLabel = (person?: { name?: string; code?: string } | null): string =>
  person?.name || person?.code || '';

export const OVERTIME_EXPORT_HEADERS = [
  'Ngày OT',
  'Dự án',
  'Người OT',
  'Người yêu cầu',
  'Khung giờ',
  'Ước tính (h)',
  'Thực tế (h)',
  'Lý do OT',
  'Mô tả chi tiết',
  'Task OT',
  'Ghi chú staff',
  'Trạng thái',
  'Người duyệt',
  'Ngày duyệt',
  'Lý do từ chối',
  'Review note',
] as const;

export const buildOvertimeExportRows = (records: OvertimeRecord[]): (string | number)[][] =>
  records.map((record) => [
    dayjs(record.otDate).format(DATE_FORMAT),
    record.project.name || record.project.code || '',
    personLabel(record.assignee),
    personLabel(record.requestedBy),
    `${record.startTime} – ${record.endTime}`,
    record.estimatedHours,
    record.actualHours ?? '',
    formatOtReasonCategories(record.reasonCategories),
    record.reason,
    record.task?.name || record.taskName || '',
    record.staffNote,
    OT_STATUS_LABELS[record.status],
    personLabel(record.approvedBy),
    record.approvedAt ? dayjs(record.approvedAt).format(DATETIME_SHORT_FORMAT) : '',
    record.rejectReason,
    record.resultReviewNote,
  ]);

export const exportOvertimeToCsv = (records: OvertimeRecord[]): void => {
  downloadCsv(
    `overtime-${dayjs().format('YYYY-MM-DD')}.csv`,
    [...OVERTIME_EXPORT_HEADERS],
    buildOvertimeExportRows(records),
  );
};
