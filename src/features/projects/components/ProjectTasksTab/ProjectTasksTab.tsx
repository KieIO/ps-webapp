import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePermission } from '@/shared/hooks/usePermission';
import { CreateTaskDrawer } from '@/features/tasks/components/CreateTaskDrawer/CreateTaskDrawer';
import { useProjectTasks } from '../../hooks/useProjectTasks';
import { ProjectDetailTaskTable } from '../ProjectDetailTaskTable/ProjectDetailTaskTable';
import { ProjectTaskViewModal } from '../ProjectTaskViewModal/ProjectTaskViewModal';
import type { Project } from '../../schemas/project.schema';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import styles from './ProjectTasksTab.module.scss';

interface ProjectTasksTabProps {
  project: Project;
}

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<MyTask | null>(null);
  const { can } = usePermission();
  const canCreate = can('CREATE_TASK');

  const { data, isLoading } = useProjectTasks(project.name);

  return (
    <>
      <ProjectDetailTaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        onView={setViewingTask}
      />

      {canCreate ? (
        <div className={styles.footer}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Tạo task
          </Button>
        </div>
      ) : null}

      {canCreate ? (
        <CreateTaskDrawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          preset={{
            projectName: project.name,
            projectManager: project.pm,
            lockProject: true,
          }}
        />
      ) : null}

      <ProjectTaskViewModal
        open={viewingTask !== null}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
      />
    </>
  );
}
