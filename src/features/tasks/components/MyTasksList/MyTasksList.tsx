import { useEffect, useMemo, useState } from 'react';
import { Alert, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { ROLES } from '@/config/permissions';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { AssignTaskModal } from '../AssignTaskModal/AssignTaskModal';
import { CreativeEditDrawer } from '../creativePipeline/CreativeEditDrawer';
import { EvaluateTaskModal } from '../EvaluateTaskModal/EvaluateTaskModal';
import { EditHeadTaskModal } from '../EditHeadTaskModal/EditHeadTaskModal';
import { EditTaskModal } from '../EditTaskModal/EditTaskModal';
import { UpdateTaskStatusModal } from '../UpdateTaskStatusModal/UpdateTaskStatusModal';
import { MyTaskFilters } from '../MyTaskFilters/MyTaskFilters';
import { TaskConfirmationSummaryBar } from '../TaskConfirmationSummaryBar/TaskConfirmationSummaryBar';
import { MyTaskTable } from '../MyTaskTable/MyTaskTable';
import { useDeleteMyTask } from '../../hooks/useDeleteMyTask';
import { useMyTaskColumns } from '../../hooks/useMyTaskColumns';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { exportMyTasksToCsv } from '../../utils/exportMyTasks';
import { shouldUseCreativePipelineEditDrawer } from '../../utils/creativePipeline';
import { canDeleteTask, canEditTaskMeta } from '../../utils/taskStatusLock';
import { computeTaskConfirmationSummary } from '../../utils/taskConfirmationSummary';
import { canEvaluateTaskLayer } from '../../utils/taskEvaluation';
import { filterTasksForViewerRole } from '../../utils/taskListVisibility';
import {
  parseWorkDateParam,
  shouldDefaultWorkDate,
  todayWorkDate,
  WORK_DATE_ALL,
  WORK_DATE_PARAM,
} from '../../utils/taskWorkDate';
import type { MyTask, MyTaskListFilters, TaskCategory } from '../../schemas/task.schema';
import styles from './MyTasksList.module.scss';

interface MyTasksListProps {
  taskCategory: TaskCategory;
}

const formatNumber = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

const parseTimeliness = (value: string | null): MyTaskListFilters['timeliness'] =>
  value === 'completed' || value === 'on_time' || value === 'not_on_time' ? value : undefined;

const parseOutputMetric = (value: string | null): MyTaskListFilters['outputMetric'] =>
  value === 'project_slides' || value === 'creative_da' ? value : undefined;

const resolveWorkDate = (
  searchParams: URLSearchParams,
  taskCategory: TaskCategory,
  defaultTodayEnabled: boolean,
): string | undefined => {
  if (taskCategory !== 'project') return undefined;
  const parsed = parseWorkDateParam(searchParams.get(WORK_DATE_PARAM));
  if (parsed) return parsed;
  if (shouldDefaultWorkDate(searchParams, defaultTodayEnabled)) return todayWorkDate();
  return undefined;
};

const readUrlFilters = (
  searchParams: URLSearchParams,
  taskCategory: TaskCategory,
  defaultTodayEnabled: boolean,
): MyTaskListFilters => {
  const completedMonth = searchParams.get('completedMonth') ?? undefined;
  const hasValidMonth = completedMonth != null && /^\d{4}-\d{2}$/.test(completedMonth);
  const timeliness = parseTimeliness(searchParams.get('timeliness'));
  const outputMonth = searchParams.get('outputMonth') ?? undefined;
  const hasValidOutputMonth = outputMonth != null && /^\d{4}-\d{2}$/.test(outputMonth);
  const outputMetric = parseOutputMetric(searchParams.get('outputMetric'));
  const projectName = searchParams.get('projectName')?.trim() || undefined;
  const search = searchParams.get('search')?.trim() || undefined;
  return {
    taskCategory,
    projectName,
    search,
    timeliness: hasValidMonth ? timeliness : undefined,
    completedMonth: hasValidMonth && timeliness ? completedMonth : undefined,
    outputMetric: hasValidOutputMonth ? outputMetric : undefined,
    outputMonth: hasValidOutputMonth && outputMetric ? outputMonth : undefined,
    workDate: resolveWorkDate(searchParams, taskCategory, defaultTodayEnabled),
  };
};

const writeWorkDateParam = (
  searchParams: URLSearchParams,
  workDate: string | undefined,
  taskCategory: TaskCategory,
) => {
  if (taskCategory !== 'project') {
    searchParams.delete(WORK_DATE_PARAM);
    return;
  }
  if (workDate) {
    searchParams.set(WORK_DATE_PARAM, workDate);
    return;
  }
  searchParams.set(WORK_DATE_PARAM, WORK_DATE_ALL);
};

export function MyTasksList({ taskCategory }: MyTasksListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const defaultTodayEnabled = taskCategory === 'project' && !can('VIEW_ALL_TASKS');
  const [filters, setFilters] = useState<MyTaskListFilters>(() =>
    readUrlFilters(searchParams, taskCategory, defaultTodayEnabled),
  );
  const [exporting, setExporting] = useState(false);
  const [editingTask, setEditingTask] = useState<MyTask | null>(null);
  const [assigningTask, setAssigningTask] = useState<MyTask | null>(null);
  const [statusTask, setStatusTask] = useState<MyTask | null>(null);
  const [evaluatingTask, setEvaluatingTask] = useState<MyTask | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const { columnDefs } = useMyTaskColumns();
  const canAssign = can('ASSIGN_TASK');
  const canEvaluate = can('EVALUATE_TASK');
  const canDelete = canDeleteTask(role);

  const canEditRow = (task: MyTask) => canEditTaskMeta(task, role, userId);

  const editingUsesCreativeDrawer = Boolean(
    editingTask && shouldUseCreativePipelineEditDrawer(editingTask, role, userId),
  );

  useEffect(() => {
    if (taskCategory === 'project' && shouldDefaultWorkDate(searchParams, defaultTodayEnabled)) {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(WORK_DATE_PARAM, todayWorkDate());
      setSearchParams(nextSearchParams, { replace: true });
    }
    setFilters((current) => ({
      ...current,
      ...readUrlFilters(searchParams, taskCategory, defaultTodayEnabled),
    }));
  }, [searchParams, setSearchParams, taskCategory, defaultTodayEnabled]);

  const handleFiltersChange = (nextFilters: MyTaskListFilters) => {
    setFilters(nextFilters);
    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextFilters.projectName) {
      nextSearchParams.set('projectName', nextFilters.projectName);
    } else {
      nextSearchParams.delete('projectName');
    }
    if (nextFilters.search) {
      nextSearchParams.set('search', nextFilters.search);
    } else {
      nextSearchParams.delete('search');
    }
    if (nextFilters.timeliness) {
      nextSearchParams.set('timeliness', nextFilters.timeliness);
    } else {
      nextSearchParams.delete('timeliness');
    }
    if (nextFilters.completedMonth) {
      nextSearchParams.set('completedMonth', nextFilters.completedMonth);
    } else {
      nextSearchParams.delete('completedMonth');
    }
    if (nextFilters.outputMetric) {
      nextSearchParams.set('outputMetric', nextFilters.outputMetric);
    } else {
      nextSearchParams.delete('outputMetric');
    }
    if (nextFilters.outputMonth) {
      nextSearchParams.set('outputMonth', nextFilters.outputMonth);
    } else {
      nextSearchParams.delete('outputMonth');
    }
    writeWorkDateParam(nextSearchParams, nextFilters.workDate, taskCategory);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleReset = () => {
    const defaultWorkDate = defaultTodayEnabled ? todayWorkDate() : undefined;
    setFilters({ taskCategory, workDate: defaultWorkDate });
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('projectName');
    nextSearchParams.delete('search');
    nextSearchParams.delete('timeliness');
    nextSearchParams.delete('completedMonth');
    nextSearchParams.delete('outputMetric');
    nextSearchParams.delete('outputMonth');
    writeWorkDateParam(nextSearchParams, defaultWorkDate, taskCategory);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const queryFilters = useMemo(() => {
    const { otOnly, ...rest } = filters;
    void otOnly;
    return { ...rest, taskCategory, search: debouncedSearch };
  }, [filters, taskCategory, debouncedSearch]);

  const { data, isLoading, isError, error } = useMyTaskList(queryFilters);

  const displayItems = useMemo(() => {
    let items = filterTasksForViewerRole(data?.items ?? [], role);
    if (filters.otOnly) {
      items = items.filter((task) => Boolean(task.overtimeRequestId));
    }
    return items;
  }, [data?.items, filters.otOnly, role]);

  const confirmationSummary = useMemo(
    () => computeTaskConfirmationSummary(displayItems),
    [displayItems],
  );
  const {
    mutate: deleteTask,
    isPending: isDeleting,
    variables: deletingVariables,
  } = useDeleteMyTask();

  const handleDelete = (task: MyTask) => {
    deleteTask(task.id, {
      onSuccess: () => {
        if (editingTask?.id === task.id) setEditingTask(null);
        if (assigningTask?.id === task.id) setAssigningTask(null);
        if (statusTask?.id === task.id) setStatusTask(null);
        if (evaluatingTask?.id === task.id) setEvaluatingTask(null);
      },
    });
  };

  const handleExport = () => {
    if (displayItems.length === 0) {
      message.warning('No tasks to export.');
      return;
    }

    setExporting(true);
    try {
      exportMyTasksToCsv(displayItems, columnDefs);
      message.success('Export downloaded.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <CardWrapper>
      <MyTaskFilters
        taskCategory={taskCategory}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
        onExport={handleExport}
        exporting={exporting}
      />

      {filters.workDate ? (
        <p className={styles.outputSummary}>
          <strong>
            {filters.workDate === todayWorkDate() ? 'Hôm nay' : 'Ngày làm việc'} ·{' '}
            {dayjs(filters.workDate, 'YYYY-MM-DD').format(DATE_FORMAT)}
          </strong>
          <span> · task có khoảng date → deadline trùng ngày này</span>
        </p>
      ) : null}

      {filters.outputMetric && data ? (
        <p className={styles.outputSummary}>
          <strong>
            {formatNumber.format(displayItems.reduce((total, task) => total + task.quantity, 0))}{' '}
            {filters.outputMetric === 'project_slides' ? 'slides' : 'DA'}
          </strong>
          <span>
            {' '}
            từ {filters.otOnly ? displayItems.length : data.total} task ·{' '}
            {filters.outputMonth ?? ''}
          </span>
        </p>
      ) : null}

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load tasks"
          description={error instanceof Error ? error.message : 'Please try again.'}
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <TaskConfirmationSummaryBar summary={confirmationSummary} />

      <MyTaskTable
        tasks={displayItems}
        loading={isLoading}
        total={filters.otOnly ? displayItems.length : (data?.total ?? 0)}
        onEdit={setEditingTask}
        canEditTask={canEditRow}
        onAssign={setAssigningTask}
        onUpdateStatus={setStatusTask}
        onEvaluate={setEvaluatingTask}
        onDelete={canDelete ? handleDelete : undefined}
        canAssign={canAssign}
        canEvaluate={canEvaluate}
        deletingTaskId={isDeleting ? (deletingVariables ?? null) : null}
      />

      <AssignTaskModal
        open={assigningTask !== null}
        task={assigningTask}
        onClose={() => setAssigningTask(null)}
      />

      {role === ROLES.HEAD ? (
        <EditHeadTaskModal
          open={editingTask !== null}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
      {role !== ROLES.HEAD && editingUsesCreativeDrawer ? (
        <CreativeEditDrawer
          open={editingTask !== null}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
      {role !== ROLES.HEAD && !editingUsesCreativeDrawer ? (
        <EditTaskModal
          open={editingTask !== null}
          task={editingTask}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={Boolean(
            canEvaluate && editingTask && canEvaluateTaskLayer(role, editingTask),
          )}
          onClose={() => setEditingTask(null)}
        />
      ) : null}

      <UpdateTaskStatusModal
        open={statusTask !== null}
        task={statusTask}
        onClose={() => setStatusTask(null)}
      />

      <EvaluateTaskModal
        open={evaluatingTask !== null}
        task={evaluatingTask}
        onClose={() => setEvaluatingTask(null)}
      />
    </CardWrapper>
  );
}
