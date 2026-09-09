import dayjs from 'dayjs';
import { EVALUATION_LEVEL_LABELS } from '@/features/projects/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import { CLASSIFICATION_LEVEL_LABELS, CONFIRMATION_LABELS } from '../constants';
import type { MyTaskColumnKey } from '../constants';
import type { MyTask } from '../schemas/task.schema';
import type { MyTaskColumnDef } from './myTaskColumns';
import { getMyTaskColumnExportValue } from './myTaskColumns';

const formatExportCell = (task: MyTask, key: MyTaskColumnKey): string | number => {
  const raw = getMyTaskColumnExportValue(task, key);

  if (
    key === 'level' ||
    key === 'designThinking' ||
    key === 'technical' ||
    key === 'contentProcessing'
  ) {
    return CLASSIFICATION_LEVEL_LABELS[raw as keyof typeof CLASSIFICATION_LEVEL_LABELS] ?? raw;
  }

  if (key === 'projectLevel' || key === 'volume' || key === 'nature' || key === 'projectTime') {
    return EVALUATION_LEVEL_LABELS[raw as keyof typeof EVALUATION_LEVEL_LABELS] ?? raw;
  }

  if (key === 'confirmation') {
    return CONFIRMATION_LABELS[raw as keyof typeof CONFIRMATION_LABELS] ?? raw;
  }

  return raw;
};

export const exportMyTasksToCsv = (tasks: MyTask[], columnDefs: MyTaskColumnDef[]): void => {
  const headers = ['Task code', ...columnDefs.map((def) => def.title)];
  const rows = tasks.map((task) => [
    task.taskCode,
    ...columnDefs.map((def) => formatExportCell(task, def.key)),
  ]);
  const category = tasks[0]?.taskCategory ?? 'tasks';

  downloadCsv(`${category}-tasks-${dayjs().format('YYYY-MM-DD')}.csv`, headers, rows);
};
