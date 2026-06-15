import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TaskDetailView } from '@/features/tasks/components/TaskDetailView/TaskDetailView';
import { useMyTask } from '@/features/tasks/hooks/useMyTask';
import type { TaskCategory } from '@/features/tasks/schemas/task.schema';
import {
  formatTaskDisplayId,
  getTaskListBackLabel,
  getTaskListPath,
} from '@/features/tasks/utils/taskDetail';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

interface TaskDetailLocationState {
  from?: TaskCategory;
}

export default function MyTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as TaskDetailLocationState | null;
  const { data: task } = useMyTask(id ?? '');

  const listCategory = locationState?.from ?? task?.taskCategory ?? 'project';
  const listPath = getTaskListPath(listCategory);
  const backLabel = getTaskListBackLabel(listCategory);

  const title = task ? `Task Detail — ${formatTaskDisplayId(task)}` : 'Task Detail';

  if (!id) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Status, description, and history"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(listPath)}>
            {backLabel}
          </Button>
        }
      />

      <TaskDetailView taskId={id} />
    </div>
  );
}
