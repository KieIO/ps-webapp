import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { usePermission } from '@/shared/hooks/usePermission';
import { CreateTaskDrawer } from '../CreateTaskDrawer/CreateTaskDrawer';
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
  const { can } = usePermission();
  const canCreate = can('CREATE_TASK');
  const isProjectList = taskCategory === 'project';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              {isProjectList ? 'Tạo task' : 'Create task'}
            </Button>
          ) : undefined
        }
      />

      <MyTasksList taskCategory={taskCategory} />

      {canCreate && isProjectList ? (
        <CreateTaskDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}

      {canCreate && !isProjectList ? (
        <CreateTaskModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          taskCategory={taskCategory}
        />
      ) : null}
    </div>
  );
}
