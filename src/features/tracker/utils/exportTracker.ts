import dayjs from 'dayjs';
import { downloadCsv } from '@/shared/utils/exportCsv';
import type { TrackerProject } from '../schemas/tracker.schema';

export const exportTrackerToCsv = (projects: TrackerProject[], monthKey?: string): void => {
  const monthSuffix = monthKey ? ` (${monthKey})` : '';
  const headers = ['Project', 'PM/CM', 'Team', `Total / tháng${monthSuffix}`];
  const rows = projects.map((project) => [
    project.name,
    [project.pm, ...(project.cm ?? [])].filter(Boolean).join(' / '),
    project.team.join(', '),
    project.totalSlides,
  ]);

  const fileMonth = monthKey ?? dayjs().format('YYYY-MM');
  downloadCsv(`project-tracker-${fileMonth}.csv`, headers, rows);
};
