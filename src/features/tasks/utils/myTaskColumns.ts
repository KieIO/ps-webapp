import type { ReactNode } from 'react';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { PROJECT_URGENCY_STYLES, STATUS_LABELS } from '@/features/projects/constants';
import {
  PROJECT_STATUSES,
  PROJECT_URGENCY_COLORS,
  type EvaluationLevel,
  type ProjectStatus,
  type ProjectUrgencyColor,
} from '@/features/projects/schemas/project.schema';
import { ROLES, type Role } from '@/config/permissions';
import {
  MY_TASK_ADMIN_COLUMN_KEYS,
  MY_TASK_COLUMN_HEADERS,
  MY_TASK_CREATIVE_MANAGER_COLUMN_KEYS,
  MY_TASK_CREATIVE_HEAD_COLUMN_KEYS,
  MY_TASK_EMPLOYEE_COLUMN_KEYS,
  MY_TASK_HEAD_COLUMN_HEADERS,
  MY_TASK_HEAD_COLUMN_KEYS,
  MY_TASK_PM_COLUMN_KEYS,
  type MyTaskColumnKey,
} from '../constants';
import type { ClassificationLevel, MyTask } from '../schemas/task.schema';
import { TASK_CONFIRMATION_STATUSES } from '../schemas/task.schema';
import { resolveProjectContextFromTask } from './taskProjectContext';
import { formatTaskStaffNames } from './staff';
import { resolveTaskUrgencyDisplay } from './taskUrgency';

const compareText = (a: string, b: string) => a.localeCompare(b, 'vi');

const compareNumber = (a: number, b: number) => a - b;

const compareOptionalNumber = (a?: number | null, b?: number | null) => (a ?? -1) - (b ?? -1);

const compareDate = (a: string, b: string) => dayjs(a).unix() - dayjs(b).unix();

const compareOptionalDate = (a?: string | null, b?: string | null) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return compareDate(a, b);
};

const compareEnumIndex = <T extends string>(values: readonly T[], a: T, b: T) =>
  values.indexOf(a) - values.indexOf(b);

export const getMyTaskColumnSorter = (key: MyTaskColumnKey): ((a: MyTask, b: MyTask) => number) => {
  switch (key) {
    case 'projectName':
      return (a, b) => compareText(a.projectName, b.projectName);
    case 'projectManager':
      return (a, b) => compareText(a.projectManager.name, b.projectManager.name);
    case 'taskName':
      return (a, b) => compareText(a.taskName, b.taskName);
    case 'level':
    case 'designThinking':
    case 'technical':
    case 'contentProcessing':
      return (a, b) => compareNumber(a[key], b[key]);
    case 'quantity':
      return (a, b) => compareNumber(a.quantity, b.quantity);
    case 'date':
      return (a, b) => compareDate(a.date, b.date);
    case 'urgency':
      return (a, b) =>
        compareEnumIndex(
          PROJECT_URGENCY_COLORS,
          resolveTaskUrgencyDisplay(a),
          resolveTaskUrgencyDisplay(b),
        );
    case 'startDate':
      return (a, b) =>
        compareOptionalDate(
          resolveProjectContextFromTask(a).projectStartDate,
          resolveProjectContextFromTask(b).projectStartDate,
        );
    case 'endDate':
      return (a, b) =>
        compareOptionalDate(
          resolveProjectContextFromTask(a).projectEndDate,
          resolveProjectContextFromTask(b).projectEndDate,
        );
    case 'finishedDate':
      return (a, b) =>
        compareOptionalDate(
          resolveProjectContextFromTask(a).projectFinishedDate,
          resolveProjectContextFromTask(b).projectFinishedDate,
        );
    case 'projectLevel':
      return (a, b) =>
        compareOptionalNumber(
          resolveProjectContextFromTask(a).projectLevel,
          resolveProjectContextFromTask(b).projectLevel,
        );
    case 'volume':
      return (a, b) =>
        compareOptionalNumber(
          resolveProjectContextFromTask(a).projectVolume,
          resolveProjectContextFromTask(b).projectVolume,
        );
    case 'nature':
      return (a, b) =>
        compareOptionalNumber(
          resolveProjectContextFromTask(a).projectNature,
          resolveProjectContextFromTask(b).projectNature,
        );
    case 'projectTime':
      return (a, b) =>
        compareOptionalNumber(
          resolveProjectContextFromTask(a).projectTime,
          resolveProjectContextFromTask(b).projectTime,
        );
    case 'brief':
      return (a, b) =>
        compareText(
          resolveProjectContextFromTask(a).projectBrief,
          resolveProjectContextFromTask(b).projectBrief,
        );
    case 'description':
      return (a, b) => compareText(a.description, b.description);
    case 'staffName':
      return (a, b) => compareText(formatTaskStaffNames(a.staff), formatTaskStaffNames(b.staff));
    case 'additionalFactors':
      return (a, b) => compareText(a.additionalFactors, b.additionalFactors);
    case 'completion':
      return (a, b) => compareOptionalNumber(a.completionPercent, b.completionPercent);
    case 'evaluation':
      return (a, b) => compareText(a.pmEvaluation, b.pmEvaluation);
    case 'pmNote':
      return (a, b) => compareText(a.pmNote, b.pmNote);
    case 'projectStatus':
      return (a, b) =>
        compareEnumIndex(
          PROJECT_STATUSES,
          resolveProjectContextFromTask(a).projectStatus,
          resolveProjectContextFromTask(b).projectStatus,
        );
    case 'confirmation':
      return (a, b) =>
        compareEnumIndex(TASK_CONFIRMATION_STATUSES, a.staffConfirmation, b.staffConfirmation);
    case 'staffNote':
      return (a, b) => compareText(a.staffNote, b.staffNote);
    default:
      return () => 0;
  }
};

export interface MyTaskColumnDef {
  key: MyTaskColumnKey;
  title: string;
  width: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

const COLUMN_WIDTHS: Record<MyTaskColumnKey, number> = {
  projectName: 200,
  projectManager: 170,
  taskName: 140,
  level: 90,
  quantity: 110,
  date: 110,
  urgency: 135,
  description: 240,
  staffName: 180,
  designThinking: 130,
  technical: 100,
  contentProcessing: 150,
  additionalFactors: 160,
  completion: 160,
  evaluation: 120,
  pmNote: 160,
  confirmation: 145,
  staffNote: 160,
  startDate: 110,
  endDate: 110,
  projectLevel: 110,
  brief: 220,
  volume: 100,
  nature: 100,
  projectTime: 110,
  projectStatus: 130,
  finishedDate: 120,
};

/** Ensure header labels are never clipped — width is at least title length + padding. */
const COLUMN_HEADER_CHAR_WIDTH = 9;
const COLUMN_HEADER_PADDING = 36;

const resolveColumnWidth = (key: MyTaskColumnKey, title: string): number =>
  Math.max(COLUMN_WIDTHS[key], title.length * COLUMN_HEADER_CHAR_WIDTH + COLUMN_HEADER_PADDING);

/** Column visibility per role for `/tasks/project` and `/tasks/non-project`. */
export const getMyTaskColumnKeysForRole = (role: Role): MyTaskColumnKey[] => {
  switch (role) {
    case ROLES.ADMIN:
      return [...MY_TASK_ADMIN_COLUMN_KEYS];
    case ROLES.HEAD:
      return [...MY_TASK_HEAD_COLUMN_KEYS];
    case ROLES.EMPLOYEE:
      return [...MY_TASK_EMPLOYEE_COLUMN_KEYS];
    case ROLES.PM:
      return [...MY_TASK_PM_COLUMN_KEYS];
    case ROLES.CREATIVE_HEAD:
      return [...MY_TASK_CREATIVE_HEAD_COLUMN_KEYS];
    case ROLES.CREATIVE_MANAGER:
      return [...MY_TASK_CREATIVE_MANAGER_COLUMN_KEYS];
    default:
      return [...MY_TASK_EMPLOYEE_COLUMN_KEYS];
  }
};

const getColumnTitle = (key: MyTaskColumnKey, role: Role): string => {
  if (role === ROLES.HEAD) {
    const headLabel = MY_TASK_HEAD_COLUMN_HEADERS[key];
    if (headLabel) return headLabel;
  }
  return MY_TASK_COLUMN_HEADERS[key];
};

export const getMyTaskColumnDefsForRole = (role: Role): MyTaskColumnDef[] =>
  getMyTaskColumnKeysForRole(role).map((key) => {
    const title = getColumnTitle(key, role);
    return {
      key,
      title,
      width: resolveColumnWidth(key, title),
      fixed: key === 'projectName' ? 'left' : undefined,
      align:
        key === 'level' ||
        key === 'projectLevel' ||
        key === 'volume' ||
        key === 'nature' ||
        key === 'projectTime' ||
        key === 'designThinking' ||
        key === 'technical' ||
        key === 'contentProcessing'
          ? 'center'
          : key === 'quantity'
            ? 'right'
            : undefined,
    };
  });

export const getMyTaskTableScrollWidth = (
  columnDefs: MyTaskColumnDef[],
  actionsWidth: number,
): number => columnDefs.reduce((sum, col) => sum + col.width, 0) + actionsWidth;

const ACTION_BUTTON_WIDTH = 32;
const ACTION_BUTTON_GAP = 2;
const ACTION_CELL_PADDING = 28;

export interface MyTaskActionsWidthOptions {
  hasUpdateStatus?: boolean;
  canAssign?: boolean;
  hasEdit?: boolean;
  canEvaluate?: boolean;
  hasDelete?: boolean;
}

/** Width for the fixed actions column — must fit all visible icon buttons without clipping. */
export const getMyTaskActionsWidth = ({
  hasUpdateStatus = false,
  canAssign = false,
  hasEdit = false,
  canEvaluate = false,
  hasDelete = false,
}: MyTaskActionsWidthOptions): number => {
  const count = [hasUpdateStatus, canAssign, hasEdit, canEvaluate, hasDelete].filter(
    Boolean,
  ).length;

  if (count === 0) return 0;

  return (
    count * ACTION_BUTTON_WIDTH + Math.max(0, count - 1) * ACTION_BUTTON_GAP + ACTION_CELL_PADDING
  );
};

const formatDate = (value?: string): string => (value ? dayjs(value).format(DATE_FORMAT) : '');

/** Resolve a cell value for CSV export from a single MyTask row. */
export const getMyTaskColumnExportValue = (task: MyTask, key: MyTaskColumnKey): string | number => {
  const ctx = resolveProjectContextFromTask(task);

  switch (key) {
    case 'projectName':
      return task.projectName;
    case 'projectManager':
      return task.projectManager.name;
    case 'taskName':
      return task.taskName;
    case 'level':
    case 'designThinking':
    case 'technical':
    case 'contentProcessing':
      return task[key];
    case 'quantity':
      return task.quantity;
    case 'date':
      return formatDate(task.date);
    case 'urgency':
      return PROJECT_URGENCY_STYLES[resolveTaskUrgencyDisplay(task)].label;
    case 'startDate':
      return formatDate(ctx.projectStartDate);
    case 'endDate':
      return formatDate(ctx.projectEndDate);
    case 'finishedDate':
      return formatDate(ctx.projectFinishedDate);
    case 'projectLevel':
      return ctx.projectLevel ?? '';
    case 'brief':
      return ctx.projectBrief ?? '';
    case 'volume':
      return ctx.projectVolume ?? '';
    case 'nature':
      return ctx.projectNature ?? '';
    case 'projectTime':
      return ctx.projectTime ?? '';
    case 'projectStatus':
      return ctx.projectStatus ? STATUS_LABELS[ctx.projectStatus] : '';
    case 'description':
      return task.description;
    case 'staffName':
      return formatTaskStaffNames(task.staff);
    case 'additionalFactors':
      return ctx.additionalFactors;
    case 'completion':
      return task.completionPercent ?? '';
    case 'evaluation':
      return ctx.pmEvaluation;
    case 'pmNote':
      return ctx.pmNote;
    case 'confirmation':
      return task.staffConfirmation;
    case 'staffNote':
      return task.staffNote;
    default:
      return '';
  }
};

export type MyTaskTableRenderers = {
  renderLevel: (level: ClassificationLevel) => ReactNode;
  renderEvaluationLevel: (level: EvaluationLevel) => ReactNode;
  renderText: (value: string) => ReactNode;
  renderTaskName: (name: string, record: MyTask) => ReactNode;
  renderConfirmation: (status: MyTask['staffConfirmation']) => ReactNode;
  renderProjectStatus: (status: ProjectStatus) => ReactNode;
  renderProjectName: (record: MyTask) => ReactNode;
  renderProjectManager: (record: MyTask) => ReactNode;
  renderStaffName: (record: MyTask) => ReactNode;
  renderDate: (value: string, record: MyTask, columnKey: MyTaskColumnKey) => ReactNode;
  renderCompletion: (value: number | undefined, record: MyTask) => ReactNode;
  renderUrgency: (urgency: ProjectUrgencyColor, record: MyTask) => ReactNode;
  renderUrgencyTitle: () => ReactNode;
  renderDescription?: (record: MyTask) => ReactNode;
};

export const buildMyTaskDataColumns = (
  columnDefs: MyTaskColumnDef[],
  renderers: MyTaskTableRenderers,
): ColumnsType<MyTask> =>
  columnDefs.map((def) => {
    const base = {
      title: def.key === 'urgency' ? renderers.renderUrgencyTitle() : def.title,
      key: def.key,
      width: def.width,
      minWidth: def.width,
      fixed: def.fixed,
      align: def.align,
      sorter: getMyTaskColumnSorter(def.key),
      showSorterTooltip: def.key === 'urgency' ? false : undefined,
    };

    switch (def.key) {
      case 'projectName':
        return {
          ...base,
          dataIndex: 'projectName',
          render: (_, record) => renderers.renderProjectName(record),
        };
      case 'projectManager':
        return {
          ...base,
          render: (_, record) => renderers.renderProjectManager(record),
        };
      case 'taskName':
        return {
          ...base,
          dataIndex: 'taskName',
          render: (name: string, record: MyTask) => renderers.renderTaskName(name, record),
        };
      case 'level':
        return {
          ...base,
          dataIndex: 'level',
          render: renderers.renderLevel,
        };
      case 'projectLevel':
        return {
          ...base,
          render: (_, record) => {
            const ctx = resolveProjectContextFromTask(record);
            return ctx.projectLevel != null
              ? renderers.renderEvaluationLevel(ctx.projectLevel as EvaluationLevel)
              : renderers.renderText('');
          },
        };
      case 'volume':
      case 'nature':
      case 'projectTime':
        return {
          ...base,
          render: (_, record) => {
            const ctx = resolveProjectContextFromTask(record);
            const value =
              ctx[
                def.key === 'volume'
                  ? 'projectVolume'
                  : def.key === 'nature'
                    ? 'projectNature'
                    : 'projectTime'
              ];
            return value != null
              ? renderers.renderEvaluationLevel(value as EvaluationLevel)
              : renderers.renderText('');
          },
        };
      case 'quantity':
        return { ...base, dataIndex: 'quantity' };
      case 'date':
      case 'startDate':
      case 'endDate':
      case 'finishedDate':
        return {
          ...base,
          render: (_, record) => {
            const ctx = resolveProjectContextFromTask(record);
            const value =
              def.key === 'date'
                ? record.date
                : def.key === 'startDate'
                  ? ctx.projectStartDate
                  : def.key === 'endDate'
                    ? ctx.projectEndDate
                    : ctx.projectFinishedDate;
            return value ? renderers.renderDate(value, record, def.key) : renderers.renderText('');
          },
        };
      case 'urgency':
        return {
          ...base,
          dataIndex: 'urgency',
          render: (_: MyTask['urgency'], record: MyTask) =>
            renderers.renderUrgency(resolveTaskUrgencyDisplay(record), record),
        };
      case 'brief':
        return {
          ...base,
          ellipsis: true,
          render: (_, record) =>
            renderers.renderText(resolveProjectContextFromTask(record).projectBrief ?? ''),
        };
      case 'description':
        return {
          ...base,
          dataIndex: 'description',
          render: (_: string, record: MyTask) =>
            renderers.renderDescription
              ? renderers.renderDescription(record)
              : renderers.renderText(record.description),
        };
      case 'staffName':
        return { ...base, render: (_, record) => renderers.renderStaffName(record) };
      case 'designThinking':
        return {
          ...base,
          dataIndex: 'designThinking',
          render: renderers.renderLevel,
        };
      case 'technical':
        return {
          ...base,
          dataIndex: 'technical',
          render: renderers.renderLevel,
        };
      case 'contentProcessing':
        return {
          ...base,
          dataIndex: 'contentProcessing',
          render: renderers.renderLevel,
        };
      case 'additionalFactors':
        return {
          ...base,
          dataIndex: 'additionalFactors',
          ellipsis: true,
          render: renderers.renderText,
        };
      case 'completion':
        return {
          ...base,
          dataIndex: 'completionPercent',
          render: (value: number | undefined, record: MyTask) =>
            renderers.renderCompletion(value, record),
        };
      case 'evaluation':
        return {
          ...base,
          dataIndex: 'pmEvaluation',
          render: renderers.renderText,
        };
      case 'pmNote':
        return {
          ...base,
          dataIndex: 'pmNote',
          ellipsis: true,
          render: renderers.renderText,
        };
      case 'projectStatus':
        return {
          ...base,
          render: (_, record) => {
            const status = resolveProjectContextFromTask(record).projectStatus;
            return status ? renderers.renderProjectStatus(status) : renderers.renderText('');
          },
        };
      case 'confirmation':
        return {
          ...base,
          dataIndex: 'staffConfirmation',
          render: (status: MyTask['staffConfirmation']) => renderers.renderConfirmation(status),
        };
      case 'staffNote':
        return {
          ...base,
          dataIndex: 'staffNote',
          ellipsis: true,
          render: renderers.renderText,
        };
      default:
        return base;
    }
  });
