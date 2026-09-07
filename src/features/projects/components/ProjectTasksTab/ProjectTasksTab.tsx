import { useProjectTasks } from '../../hooks/useProjectTasks';
import { ProjectDetailTaskTable } from '../ProjectDetailTaskTable/ProjectDetailTaskTable';
import type { Project } from '../../schemas/project.schema';

interface ProjectTasksTabProps {
  project: Project;
}

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const { data, isLoading } = useProjectTasks(project.name);

  return (
    <ProjectDetailTaskTable
      tasks={data?.items ?? []}
      loading={isLoading}
      total={data?.total ?? 0}
    />
  );
}
