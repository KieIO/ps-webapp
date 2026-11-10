import { useMemo } from 'react';
import { ROLES } from '@/config/permissions';
import { filterTasksForViewerRole } from '@/features/tasks/utils/taskListVisibility';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useProjectTasks } from '../../hooks/useProjectTasks';
import { ProjectDetailTaskTable } from '../ProjectDetailTaskTable/ProjectDetailTaskTable';
import type { Project } from '../../schemas/project.schema';
import styles from './ProjectTasksTab.module.scss';

interface ProjectTasksTabProps {
  project: Project;
}

export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  const role = useAppSelector((state) => state.auth.user?.role);
  const { data, isLoading } = useProjectTasks(project.name);

  const tasks = useMemo(() => {
    const items = data?.items ?? [];
    // PM oversight: keep parents (incl. Đã chia nhỏ) + revisions; hide CM→Staff slices.
    if (role === ROLES.PM) {
      return filterTasksForViewerRole(items, role);
    }
    return items;
  }, [data?.items, role]);

  const hint =
    role === ROLES.PM
      ? 'Danh sách theo dự án gồm task cha (kể cả đã chia nhỏ) và revision. Task nhỏ do CM giao Staff không hiện với PM.'
      : 'Danh sách theo dự án gồm cả task cha và task con (kể cả QA), khớp các ô trên Project Tracker.';

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>{hint}</p>
      <ProjectDetailTaskTable tasks={tasks} loading={isLoading} total={tasks.length} />
    </div>
  );
}
