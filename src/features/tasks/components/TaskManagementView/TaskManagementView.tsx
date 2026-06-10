import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
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

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create task
          </Button>
        }
      />

      <MyTasksList taskCategory={taskCategory} />

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        taskCategory={taskCategory}
      />
    </div>
  );
}
