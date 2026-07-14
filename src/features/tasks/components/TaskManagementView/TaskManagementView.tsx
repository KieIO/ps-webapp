import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ROLES } from '@/config/permissions';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { CreateTaskModal } from '../CreateTaskModal/CreateTaskModal';
import { MyTasksList } from '../MyTasksList/MyTasksList';
import type { TaskCategory } from '../../schemas/task.schema';

interface TaskManagementViewProps {
  title: string;
  subtitle: string;
  taskCategory: TaskCategory;
}

export function TaskManagementView({ title, subtitle, taskCategory }: TaskManagementViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const role = useAppSelector((state) => state.auth.user?.role);
  // Create form loads task-score catalogs (MANAGE_USERS). Employees use Confirm/Finish on Home / detail.
  const canCreateTask = role != null && role !== ROLES.EMPLOYEE;

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          canCreateTask ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create task
            </Button>
          ) : undefined
        }
      />

      <MyTasksList taskCategory={taskCategory} />

      {canCreateTask ? (
        <CreateTaskModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          taskCategory={taskCategory}
        />
      ) : null}
    </div>
  );
}
