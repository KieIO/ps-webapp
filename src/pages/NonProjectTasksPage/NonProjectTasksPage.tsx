import { TaskManagementView } from '@/features/tasks/components/TaskManagementView/TaskManagementView';

export default function NonProjectTasksPage() {
  return (
    <TaskManagementView
      title="Non-project tasks"
      subtitle="Non-project task list and status"
      taskCategory="non_project"
    />
  );
}
