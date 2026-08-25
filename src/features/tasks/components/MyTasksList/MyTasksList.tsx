import { useEffect, useMemo, useState } from 'react';
import { Alert, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { usePermission } from '@/shared/hooks/usePermission';
import { ROLES } from '@/config/permissions';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { AssignTaskModal } from '../AssignTaskModal/AssignTaskModal';
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
import { canDeleteTask, canEditTask } from '../../utils/taskStatusLock';
import { computeTaskConfirmationSummary } from '../../utils/taskConfirmationSummary';
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

export function MyTasksList({ taskCategory }: MyTasksListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MyTaskListFilters>(() => {
    const completedMonth = searchParams.get('completedMonth') ?? undefined;
    const hasValidMonth = completedMonth != null && /^\d{4}-\d{2}$/.test(completedMonth);
    const timeliness = parseTimeliness(searchParams.get('timeliness'));
    const outputMonth = searchParams.get('outputMonth') ?? undefined;
    const hasValidOutputMonth = outputMonth != null && /^\d{4}-\d{2}$/.test(outputMonth);
    const outputMetric = parseOutputMetric(searchParams.get('outputMetric'));
    return {
      taskCategory,
      timeliness: hasValidMonth ? timeliness : undefined,
      completedMonth: hasValidMonth && timeliness ? completedMonth : undefined,
      outputMetric: hasValidOutputMonth ? outputMetric : undefined,
      outputMonth: hasValidOutputMonth && outputMetric ? outputMonth : undefined,
    };
  });
  const [exporting, setExporting] = useState(false);
  const [editingTask, setEditingTask] = useState<MyTask | null>(null);
  const [assigningTask, setAssigningTask] = useState<MyTask | null>(null);
  const [statusTask, setStatusTask] = useState<MyTask | null>(null);
  const [evaluatingTask, setEvaluatingTask] = useState<MyTask | null>(null);
  const [debouncedSearch] = useDebounce(filters.search, 300);
  const { can, role } = usePermission();
  const { columnDefs } = useMyTaskColumns();
  const canAssign = can('ASSIGN_TASK');
  const canEvaluate = can('EVALUATE_TASK');
  const canEdit = canEditTask(role);
  const canDelete = canDeleteTask(role);

  useEffect(() => {
    const completedMonth = searchParams.get('completedMonth') ?? undefined;
    const hasValidMonth = completedMonth != null && /^\d{4}-\d{2}$/.test(completedMonth);
    const timeliness = parseTimeliness(searchParams.get('timeliness'));
    const outputMonth = searchParams.get('outputMonth') ?? undefined;
    const hasValidOutputMonth = outputMonth != null && /^\d{4}-\d{2}$/.test(outputMonth);
    const outputMetric = parseOutputMetric(searchParams.get('outputMetric'));
    setFilters((current) => ({
      ...current,
      taskCategory,
      timeliness: hasValidMonth ? timeliness : undefined,
      completedMonth: hasValidMonth && timeliness ? completedMonth : undefined,
      outputMetric: hasValidOutputMonth ? outputMetric : undefined,
      outputMonth: hasValidOutputMonth && outputMetric ? outputMonth : undefined,
    }));
  }, [searchParams, taskCategory]);

  const handleFiltersChange = (nextFilters: MyTaskListFilters) => {
    setFilters(nextFilters);
    const nextSearchParams = new URLSearchParams(searchParams);
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
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleReset = () => {
    setFilters({ taskCategory });
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('timeliness');
    nextSearchParams.delete('completedMonth');
    nextSearchParams.delete('outputMetric');
    nextSearchParams.delete('outputMonth');
    setSearchParams(nextSearchParams, { replace: true });
  };

  const queryFilters = useMemo(() => {
    const { otOnly, ...rest } = filters;
    void otOnly;
    return { ...rest, taskCategory, search: debouncedSearch };
  }, [filters, taskCategory, debouncedSearch]);

  const { data, isLoading, isError, error } = useMyTaskList(queryFilters);

  const displayItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!filters.otOnly) return items;
    return items.filter((task) => Boolean(task.overtimeRequestId));
  }, [data?.items, filters.otOnly]);

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
        onEdit={canEdit ? setEditingTask : undefined}
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

      {canEdit && role === ROLES.HEAD ? (
        <EditHeadTaskModal
          open={editingTask !== null}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
      {canEdit && role !== ROLES.HEAD ? (
        <EditTaskModal
          open={editingTask !== null}
          task={editingTask}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={canEvaluate}
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
