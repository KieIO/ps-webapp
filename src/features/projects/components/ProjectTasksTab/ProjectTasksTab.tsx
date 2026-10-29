import { useProjectTasks } from '../../hooks/useProjectTasks';
import { ProjectDetailTaskTable } from '../ProjectDetailTaskTable/ProjectDetailTaskTable';
import type { Project } from '../../schemas/project.schema';
import styles from './ProjectTasksTab.module.scss';

interface ProjectTasksTabProps {
  project: Project;
}

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const { data, isLoading } = useProjectTasks(project.name);

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>
        Danh sách theo dự án gồm cả task cha và task con (kể cả QA), khớp các ô trên Project
        Tracker.
      </p>
      <ProjectDetailTaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
      />
    </div>
  );
}
