import { PERMISSIONS, type Role } from '@/config/permissions';

/** Roles allowed on `/reports/team-comparison` (sidebar + route + page). */
export const canAccessTeamComparison = (role: Role | undefined): boolean =>
  Boolean(role && (PERMISSIONS.EXPORT_REPORT as readonly Role[]).includes(role));
