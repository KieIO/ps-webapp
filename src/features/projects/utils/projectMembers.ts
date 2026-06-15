import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { PersonWithCode, Project } from '../schemas/project.schema';
import { isTaskForProject } from './projectTaskCount';

type ProjectLike = Pick<Project, 'id' | 'code' | 'name'>;

const toPerson = (staff: MyTask['staff'][number]): PersonWithCode => ({
  code: staff.code,
  name: staff.name,
  userId: staff.userId ?? undefined,
});

const collectUniqueMembers = (members: PersonWithCode[]): PersonWithCode[] => {
  const seen = new Map<string, PersonWithCode>();
  for (const member of members) {
    if (!member.code) continue;
    const existing = seen.get(member.code);
    if (!existing) {
      seen.set(member.code, member);
      continue;
    }
    if (!existing.userId && member.userId) {
      seen.set(member.code, { ...existing, userId: member.userId });
    }
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
