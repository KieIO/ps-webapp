import { useMemo, useState } from 'react';
import { message } from 'antd';
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
import { computeTaskConfirmationSummary } from '../../utils/taskConfirmationSummary';
import type { MyTask, MyTaskListFilters, TaskCategory } from '../../schemas/task.schema';

interface MyTasksListProps {
  taskCategory: TaskCategory;
}

export function MyTasksList({ taskCategory }: MyTasksListProps) {
  const [filters, setFilters] = useState<MyTaskListFilters>({ taskCategory });
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

  const queryFilters = useMemo(
    () => ({ ...filters, taskCategory, search: debouncedSearch }),
    [filters, taskCategory, debouncedSearch],
  );

  const { data, isLoading } = useMyTaskList(queryFilters);

  const confirmationSummary = useMemo(
    () => computeTaskConfirmationSummary(data?.items ?? []),
    [data?.items],
  );
  const { mutate: deleteTask, isPending: isDeleting, variables: deletingVariables } =
    useDeleteMyTask();

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
    const items = data?.items ?? [];
    if (items.length === 0) {
      message.warning('No tasks to export.');
      return;
    }

    setExporting(true);
    try {
      exportMyTasksToCsv(items, columnDefs);
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
        onChange={setFilters}
        onReset={() => setFilters({ taskCategory })}
        onExport={handleExport}
        exporting={exporting}
      />

      <TaskConfirmationSummaryBar summary={confirmationSummary} />

      <MyTaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        onEdit={setEditingTask}
        onAssign={setAssigningTask}
        onUpdateStatus={setStatusTask}
        onEvaluate={setEvaluatingTask}
        onDelete={handleDelete}
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
      ) : (
        <EditTaskModal
          open={editingTask !== null}
          task={editingTask}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={canEvaluate}
          onClose={() => setEditingTask(null)}
        />
      )}

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
