import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal/CreateTaskModal';
import { usePermission } from '@/shared/hooks/usePermission';
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
  const canAssignTask = can('ASSIGN_TASK');

  const { data, isLoading } = useProjectTasks(project.name);

  return (
    <>
      <ProjectDetailTaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        onView={setViewingTask}
      />

      {canAssignTask && (
        <div className={styles.footer}>
          <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Assign new task
          </Button>
        </div>
      )}

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        taskCategory="project"
        preset={{
          projectName: project.name,
          projectManager: project.pm,
        }}
      />

      <ProjectTaskViewModal
        open={viewingTask !== null}
        task={viewingTask}
        onClose={() => setViewingTask(null)}
      />
    </>
  );
}
