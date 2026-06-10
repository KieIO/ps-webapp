import type { Permission, Role } from '@/config/permissions';

/** Runtime permission map: each permission key maps to roles that are granted. */
export type PermissionConfigMap = Record<Permission, Role[]>;

export interface PermissionChange {
  permission: Permission;
  role: Role;
  granted: boolean;
}

export interface PermissionAuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  summary: string;
  changes: PermissionChange[];
}

export interface StoredRbacData {
  version: 1;
  config: PermissionConfigMap;
  updatedAt: string;
  auditLog: PermissionAuditEntry[];
}
