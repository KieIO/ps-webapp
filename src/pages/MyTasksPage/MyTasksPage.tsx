import { TaskManagementView } from '@/features/tasks/components/TaskManagementView/TaskManagementView';

export default function MyTasksPage() {
  return (
    <TaskManagementView
      title="Project Tasks"
      subtitle="Project task list and status"
      taskCategory="project"
    />
  );
}
