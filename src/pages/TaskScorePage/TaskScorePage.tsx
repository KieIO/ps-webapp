import { useState } from 'react';
import { Button, Space } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CreateTaskScoreModal } from '@/features/task-scores/components/CreateTaskScoreModal/CreateTaskScoreModal';
import { EditTaskScoreModal } from '@/features/task-scores/components/EditTaskScoreModal/EditTaskScoreModal';
import { ManageTaskScoreGroupsModal } from '@/features/task-scores/components/ManageTaskScoreGroupsModal/ManageTaskScoreGroupsModal';
import { TaskScoreList } from '@/features/task-scores/components/TaskScoreList/TaskScoreList';
import type { TaskScore } from '@/features/task-scores/schemas/taskScore.schema';

export default function TaskScorePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskScore | null>(null);

  const handleEdit = (task: TaskScore) => {
    setEditingTask(task);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingTask(null);
  };

  return (
    <div>
      <PageHeader
        title="Task score"
        subtitle="Manage task types, scores, and groups"
        actions={
          <Space>
            <Button icon={<AppstoreOutlined />} onClick={() => setGroupsOpen(true)}>
              Manage groups
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create task
            </Button>
          </Space>
        }
      />

      <TaskScoreList onEdit={handleEdit} />

      <ManageTaskScoreGroupsModal open={groupsOpen} onClose={() => setGroupsOpen(false)} />
      <CreateTaskScoreModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditTaskScoreModal open={editOpen} task={editingTask} onClose={handleCloseEdit} />
    </div>
  );
}
