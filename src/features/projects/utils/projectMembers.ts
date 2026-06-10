import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { PersonWithCode, Project } from '../schemas/project.schema';
import { isTaskForProject } from './projectTaskCount';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

const toPerson = (staff: MyTask['staff'][number]): PersonWithCode => ({
  code: staff.code,
  name: staff.name,
});

const collectUniqueMembers = (members: PersonWithCode[]): PersonWithCode[] => {
  const seen = new Map<string, PersonWithCode>();
  for (const member of members) {
    if (!member.code) continue;
    seen.set(member.code, member);
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const collectProjectMembers = (
  project: ProjectLike,
  tasks: MyTask[],
  allProjects: ProjectLike[],
  extraMembers: PersonWithCode[] = [],
): PersonWithCode[] => {
  const members: PersonWithCode[] = [...extraMembers];

  for (const task of tasks) {
    if (!isTaskForProject(project, task, allProjects)) continue;
    members.push(...task.staff.map(toPerson));
  }

  return collectUniqueMembers(members);
};
