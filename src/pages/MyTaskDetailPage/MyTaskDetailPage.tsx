import { useParams } from 'react-router-dom';
import { TaskDetailView } from '@/features/tasks/components/TaskDetailView/TaskDetailView';

export default function MyTaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <TaskDetailView taskId={id} />;
}
