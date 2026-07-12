import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { downloadCsv } from '@/shared/utils/exportCsv';
import {
  DEPARTMENT_LABELS,
  EVALUATION_LEVEL_LABELS,
  PROJECT_EVALUATION_COLUMN_HEADERS,
  PROJECT_NAME_COLUMN_LABEL,
  PROJECT_TABLE_COLUMN_HEADERS,
  PROJECT_URGENCY_STYLES,
  STATUS_LABELS,
} from '../constants';
import type { Project } from '../schemas/project.schema';

export const exportProjectsToCsv = (projects: Project[]): void => {
  const headers = [
    PROJECT_TABLE_COLUMN_HEADERS.client,
    PROJECT_NAME_COLUMN_LABEL,
    PROJECT_TABLE_COLUMN_HEADERS.department,
    PROJECT_TABLE_COLUMN_HEADERS.tasks,
    PROJECT_TABLE_COLUMN_HEADERS.startDate,
    PROJECT_TABLE_COLUMN_HEADERS.endDate,
    'Urgency',
    PROJECT_TABLE_COLUMN_HEADERS.level,
    PROJECT_TABLE_COLUMN_HEADERS.headName,
    PROJECT_TABLE_COLUMN_HEADERS.brief,
    PROJECT_EVALUATION_COLUMN_HEADERS.volume,
    PROJECT_EVALUATION_COLUMN_HEADERS.nature,
    PROJECT_EVALUATION_COLUMN_HEADERS.time,
    PROJECT_EVALUATION_COLUMN_HEADERS.additionalFactors,
    PROJECT_TABLE_COLUMN_HEADERS.pmName,
    PROJECT_TABLE_COLUMN_HEADERS.evaluation,
    PROJECT_TABLE_COLUMN_HEADERS.note,
    PROJECT_TABLE_COLUMN_HEADERS.status,
    PROJECT_TABLE_COLUMN_HEADERS.finishedDate,
  ];

  const rows = projects.map((project) => [
    project.client.name,
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
