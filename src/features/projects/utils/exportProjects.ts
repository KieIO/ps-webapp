import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import {
  DEPARTMENT_LABELS,
  EVALUATION_LEVEL_LABELS,
  PROJECT_EVALUATION_COLUMN_HEADERS,
  PROJECT_URGENCY_STYLES,
  STATUS_LABELS,
} from '../constants';
import type { Project } from '../schemas/project.schema';

export const exportProjectsToCsv = (projects: Project[]): void => {
  const headers = [
    'Client',
    'Project Name',
    'Phòng ban',
    'Tasks',
    'Start Date',
    'End Date',
    'Urgency',
    'Project Level',
    'Head Name',
    'Brief',
    PROJECT_EVALUATION_COLUMN_HEADERS.volume,
    PROJECT_EVALUATION_COLUMN_HEADERS.nature,
    PROJECT_EVALUATION_COLUMN_HEADERS.time,
    PROJECT_EVALUATION_COLUMN_HEADERS.additionalFactors,
    'PM Name',
    'Đánh Giá',
    'Note',
    'Project Status',
    'Finished Date',
  ];

  const rows = projects.map((project) => [
    project.client,
    project.name,
    DEPARTMENT_LABELS[project.department],
    project.taskCount,
    dayjs(project.startDate).format(DATE_FORMAT),
    dayjs(project.endDate).format(DATE_FORMAT),
    PROJECT_URGENCY_STYLES[project.urgency].label,
    project.projectLevel,
    project.departmentHead.name,
    project.brief,
    EVALUATION_LEVEL_LABELS[project.volume as keyof typeof EVALUATION_LEVEL_LABELS],
    EVALUATION_LEVEL_LABELS[project.nature as keyof typeof EVALUATION_LEVEL_LABELS],
    EVALUATION_LEVEL_LABELS[project.time as keyof typeof EVALUATION_LEVEL_LABELS],
    project.additionalFactors,
    project.pm.name,
    project.evaluation,
    project.note,
    STATUS_LABELS[project.status],
    project.finishedDate ? dayjs(project.finishedDate).format(DATE_FORMAT) : '',
  ]);

  downloadCsv(`projects-${dayjs().format('YYYY-MM-DD')}.csv`, headers, rows);
};
