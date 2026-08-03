import dayjs from 'dayjs';
import { downloadCsv } from '@/shared/utils/exportCsv';
import type { TrackerProject } from '../schemas/tracker.schema';

export const exportTrackerToCsv = (projects: TrackerProject[]): void => {
  const headers = ['Project', 'PM/CM', 'Team', 'Total Slides'];
  const rows = projects.map((project) => [
    project.name,
    [project.pm, ...(project.cm ?? [])].filter(Boolean).join(' / '),
    project.team.join(', '),
    project.totalSlides,
  ]);

  downloadCsv(`project-tracker-${dayjs().format('YYYY-MM-DD')}.csv`, headers, rows);
};
