import dayjs from 'dayjs';
import { downloadCsv } from '@/shared/utils/exportCsv';
import type { TrackerProject } from '../schemas/tracker.schema';
import { formatTrackerTotal } from './formatTrackerTotal';

export const exportTrackerToCsv = (projects: TrackerProject[], monthKey?: string): void => {
  const headers = ['Project', 'PM/CM', 'Team', 'Total'];
  void monthKey;
  const rows = projects.map((project) => [
    project.name,
    [project.pm, ...(project.cm ?? [])].filter(Boolean).join(' / '),
    project.team.join(', '),
    formatTrackerTotal(project),
  ]);

  const fileMonth = monthKey ?? dayjs().format('YYYY-MM');
  downloadCsv(`project-tracker-${fileMonth}.csv`, headers, rows);
};
