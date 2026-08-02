import { ROLES, type Role } from '@/config/permissions';
import type { AuthUser } from '@/features/auth/schemas/auth.schema';
import type { EmployeeCapacity } from '@/features/capacity/schemas/capacity.schema';
import type { Project } from '@/features/projects/schemas/project.schema';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import type { User } from '@/features/users/schemas/user.schema';
import { USER_DEPARTMENTS, type UserDepartment } from '@/features/users/constants';
import { mapJobLevelCode } from '@/features/users/utils/jobLevel';

export const CREATIVE_USER_DEPARTMENTS: readonly UserDepartment[] = ['creative_hcm', 'creative_ag'];

export const isCreativeUserDepartment = (department: UserDepartment): boolean =>
  CREATIVE_USER_DEPARTMENTS.includes(department);

export const isCompanyWideHomeRole = (role: Role): boolean =>
  role === ROLES.HEAD || role === ROLES.ADMIN;

/** Creative Head dashboard — creative-department scope (excludes Creative Manager). */
export const isCreativeHomeRole = (role: Role): boolean => role === ROLES.CREATIVE_HEAD;

/**
 * Overall Dashboard for Admin, Department Head, and Creative Head.
 * Employee / PM / Creative Manager do not use Home.
 */
export const isHeadHomeDashboardRole = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD || role === ROLES.ADMIN;

/** Roles allowed to open `/home` (sidebar + route). */
export const canAccessHomePage = (role: Role | undefined): boolean =>
  role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD || role === ROLES.ADMIN;

/**
 * PM / Creative Manager — team productivity report (not Home).
 * Kept for Reports → Productivity role switch.
 */
export const isOpsManagerHomeRole = (role: Role | undefined): boolean =>
  role === ROLES.PM || role === ROLES.CREATIVE_MANAGER;

/** Individual contributor Home. */
export const isEmployeeHomeRole = (role: Role | undefined): boolean => role === ROLES.EMPLOYEE;

const matchesPerson = (
  person: { userId?: string | null; name: string },
  user: AuthUser,
): boolean => {
  if (person.userId && person.userId === user.id) return true;
  return person.name.trim().toLowerCase() === user.name.trim().toLowerCase();
};

/** Active running projects in the viewer's data scope. */
export const scopeProjectsForHome = (
  projects: Project[],
  user: AuthUser,
  context?: { tasks?: MyTask[]; users?: User[] },
): Project[] => {
  const active = projects.filter(
    (project) => !project.archivedAt && project.status === 'in_progress',
  );

  if (isCompanyWideHomeRole(user.role)) {
    return active;
  }

  if (isCreativeHomeRole(user.role)) {
    return scopeCreativeHeadProjects(active, context?.tasks ?? [], context?.users ?? []);
  }

  if (user.role === ROLES.CREATIVE_MANAGER) {
    return active.filter((project) => project.department === 'creative');
  }

  if (user.role === ROLES.PM) {
    return active.filter((project) => matchesPerson(project.pm, user));
  }

  return [];
};

/**
 * Creative Head scope: creative-department projects, plus running projects that have
 * creative-department assignees on tasks.
 */
export const scopeCreativeHeadProjects = (
  activeProjects: Project[],
  tasks: MyTask[],
  users: User[],
): Project[] => {
  const creativeUserIds = new Set(
    users.filter((entry) => isCreativeUserDepartment(entry.department)).map((entry) => entry.id),
  );

  const relatedNames = new Set(
    tasks
      .filter(
        (task) =>
          task.department === 'creative' ||
          task.staff.some((member) => member.userId != null && creativeUserIds.has(member.userId)),
      )
      .map((task) => task.projectName)
      .filter(Boolean),
  );

  return activeProjects.filter(
    (project) => project.department === 'creative' || relatedNames.has(project.name),
  );
};

/** Tasks visible for Home aggregations (manager dashboard). */
export const scopeTasksForHome = (
  tasks: MyTask[],
  user: AuthUser,
  scopedProjects: Project[],
): MyTask[] => {
  const projectIds = new Set(scopedProjects.map((project) => project.id));
  const projectNames = new Set(scopedProjects.map((project) => project.name));

  if (isCompanyWideHomeRole(user.role)) {
    return tasks;
  }

  if (isCreativeHomeRole(user.role)) {
    return tasks.filter((task) => {
      if (task.department === 'creative') return true;
      if (task.projectId && projectIds.has(task.projectId)) return true;
      return projectNames.has(task.projectName);
    });
  }

  if (user.role === ROLES.CREATIVE_MANAGER) {
    return tasks.filter((task) => {
      if (task.projectId && projectIds.has(task.projectId)) return true;
      return projectNames.has(task.projectName);
    });
  }

  if (user.role === ROLES.PM) {
    return tasks.filter((task) => {
      if (matchesPerson(task.projectManager, user)) return true;
      if (task.projectId && projectIds.has(task.projectId)) return true;
      return projectNames.has(task.projectName);
    });
  }

  return [];
};

/** Capacity rows in the viewer's department / team scope. */
export const scopeCapacityForHome = (
  items: EmployeeCapacity[],
  user: AuthUser,
): EmployeeCapacity[] => {
  if (isCompanyWideHomeRole(user.role)) {
    return items;
  }

  if (isCreativeHomeRole(user.role)) {
    return items.filter((item) => isCreativeUserDepartment(item.department));
  }

  if (user.role === ROLES.PM) {
    return items.filter((item) => item.id === user.id);
  }

  return [];
};

export type WorkloadRowKind = 'pm' | 'creative_manager' | 'lead';

export type WorkloadPerson = {
  id?: string;
  name: string;
  code?: string;
  departmentLabel?: string;
};

/** Workload overview row axis by viewer role. */
export const getWorkloadRowKind = (role: Role): WorkloadRowKind => {
  if (role === ROLES.CREATIVE_HEAD) return 'creative_manager';
  if (role === ROLES.CREATIVE_MANAGER) return 'lead';
  // Department Head, Admin (+ deferred PM view) → group by PM
  return 'pm';
};

export const WORKLOAD_PERSON_COLUMN_LABEL: Record<WorkloadRowKind, string> = {
  pm: 'PM',
  creative_manager: 'CM',
  lead: 'Lead',
};

const personKey = (person: WorkloadPerson): string =>
  person.id ?? person.code ?? person.name.trim().toLowerCase();

/**
 * People who appear as workload overview rows.
 * - Department Head / Admin → Project Managers (PM)
 * - Creative Head → Creative Managers (CM)
 * - Creative Manager (deferred) → Lead staff
 */
export const selectWorkloadPeople = (
  role: Role,
  users: User[],
  scopedProjects: Project[],
): WorkloadPerson[] => {
  const activeUsers = users.filter((entry) => entry.status === 'active');

  if (role === ROLES.CREATIVE_HEAD) {
    return activeUsers
      .filter(
        (entry) =>
          entry.role === ROLES.CREATIVE_MANAGER && isCreativeUserDepartment(entry.department),
      )
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        departmentLabel: entry.department,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (role === ROLES.CREATIVE_MANAGER) {
    const leads = activeUsers.filter((entry) => {
      if (entry.role !== ROLES.EMPLOYEE || !isCreativeUserDepartment(entry.department)) {
        return false;
      }
      const level = mapJobLevelCode(entry.jobLevelCode);
      return level === 'manager' || level === 'senior';
    });

    const fallback =
      leads.length > 0
        ? leads
        : activeUsers.filter(
            (entry) => entry.role === ROLES.EMPLOYEE && isCreativeUserDepartment(entry.department),
          );

    return fallback
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        departmentLabel: entry.department,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Department Head / Admin / PM — rows are Project Managers
  const byKey = new Map<string, WorkloadPerson>();

  for (const entry of activeUsers) {
    if (entry.role !== ROLES.PM) continue;
    byKey.set(entry.id, {
      id: entry.id,
      name: entry.name,
      departmentLabel: entry.department,
    });
  }

  for (const project of scopedProjects) {
    const key = personKey({
      id: project.pm.userId,
      code: project.pm.code,
      name: project.pm.name,
    });
    if (byKey.has(key)) continue;
    // Avoid duplicate by name when userId missing on project.pm
    const existingByName = [...byKey.values()].find(
      (person) => person.name.trim().toLowerCase() === project.pm.name.trim().toLowerCase(),
    );
    if (existingByName) continue;
    byKey.set(key, {
      id: project.pm.userId,
      name: project.pm.name,
      code: project.pm.code,
    });
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const isKnownUserDepartment = (value: string): value is UserDepartment =>
  (USER_DEPARTMENTS as readonly string[]).includes(value);

/** True when person is on the task as staff (not as project PM). */
export const isStaffOnTask = (task: MyTask, person: { id?: string; name: string }): boolean => {
  const needle = person.name.trim().toLowerCase();
  return task.staff.some(
    (member) =>
      (person.id != null && member.userId === person.id) ||
      member.name.trim().toLowerCase() === needle,
  );
};

/** True when person is the task's project manager. */
export const isPmOnTask = (task: MyTask, person: { id?: string; name: string }): boolean => {
  if (person.id && task.projectManager.userId === person.id) return true;
  return task.projectManager.name.trim().toLowerCase() === person.name.trim().toLowerCase();
};
