import { PERMISSIONS, ROLES, type Permission, type Role } from '@/config/permissions';

const ALL_ROLES = Object.values(ROLES);
import {
  IMMUTABLE_GRANTS,
  RBAC_AUDIT_LOG_LIMIT,
  RBAC_STORAGE_KEY,
  RBAC_STORAGE_VERSION,
} from '../constants';
import type {
  PermissionAuditEntry,
  PermissionChange,
  PermissionConfigMap,
  StoredRbacData,
} from '../types';

const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const getDefaultPermissionConfig = (): PermissionConfigMap => {
  const config = {} as PermissionConfigMap;

  (Object.entries(PERMISSIONS) as [Permission, readonly Role[]][]).forEach(
    ([permission, roles]) => {
      config[permission] = [...roles];
    },
  );

  return config;
};

const cloneConfig = (config: PermissionConfigMap): PermissionConfigMap =>
  Object.fromEntries(
    ALL_PERMISSIONS.map((permission) => [permission, [...config[permission]]]),
  ) as PermissionConfigMap;

const isValidRole = (value: unknown): value is Role =>
  typeof value === 'string' && ALL_ROLES.includes(value as Role);

const mergeWithDefaults = (partial: Partial<PermissionConfigMap>): PermissionConfigMap => {
  const defaults = getDefaultPermissionConfig();

  return Object.fromEntries(
    ALL_PERMISSIONS.map((permission) => {
      const roles = partial[permission];
      if (!Array.isArray(roles)) {
        return [permission, defaults[permission]];
      }

      const validRoles = roles.filter(isValidRole);
      const stored = validRoles.length > 0 ? validRoles : defaults[permission];
      // Union code defaults so new default grants (e.g. HEAD on ASSIGN_TASK) apply
      // even when an older RBAC config was saved to localStorage.
      const merged = [...new Set([...stored, ...defaults[permission]])];
      return [permission, merged];
    }),
  ) as PermissionConfigMap;
};

const enforceImmutableGrants = (config: PermissionConfigMap): PermissionConfigMap => {
  const next = cloneConfig(config);

  (Object.entries(IMMUTABLE_GRANTS) as [Permission, readonly Role[]][]).forEach(
    ([permission, requiredRoles]) => {
      const current = new Set(next[permission]);
      requiredRoles.forEach((role) => current.add(role));
      next[permission] = [...current];
    },
  );

  return next;
};

const parseStoredData = (raw: string): StoredRbacData | null => {
  try {
    const parsed = JSON.parse(raw) as StoredRbacData;
    if (parsed.version !== RBAC_STORAGE_VERSION || !parsed.config) {
      return null;
    }

    return {
      version: RBAC_STORAGE_VERSION,
      config: enforceImmutableGrants(mergeWithDefaults(parsed.config)),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
    };
  } catch {
    return null;
  }
};

export const loadStoredRbacData = (): StoredRbacData | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(RBAC_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return parseStoredData(raw);
};

export const loadPermissionConfig = (): {
  config: PermissionConfigMap;
  source: 'default' | 'localStorage';
  updatedAt: string | null;
  auditLog: PermissionAuditEntry[];
} => {
  const stored = loadStoredRbacData();

  if (!stored) {
    return {
      config: getDefaultPermissionConfig(),
      source: 'default',
      updatedAt: null,
      auditLog: [],
    };
  }

  return {
    config: stored.config,
    source: 'localStorage',
    updatedAt: stored.updatedAt,
    auditLog: stored.auditLog,
  };
};

export const configsAreEqual = (
  left: PermissionConfigMap,
  right: PermissionConfigMap,
): boolean =>
  ALL_PERMISSIONS.every((permission) => {
    const a = [...left[permission]].sort().join(',');
    const b = [...right[permission]].sort().join(',');
    return a === b;
  });

export const diffPermissionConfigs = (
  previous: PermissionConfigMap,
  next: PermissionConfigMap,
): PermissionChange[] => {
  const changes: PermissionChange[] = [];

  ALL_PERMISSIONS.forEach((permission) => {
    const prevSet = new Set(previous[permission]);
    const nextSet = new Set(next[permission]);

    prevSet.forEach((role) => {
      if (!nextSet.has(role)) {
        changes.push({ permission, role, granted: false });
      }
    });

    nextSet.forEach((role) => {
      if (!prevSet.has(role)) {
        changes.push({ permission, role, granted: true });
      }
    });
  });

  return changes;
};

export const savePermissionConfig = (
  config: PermissionConfigMap,
  auditEntry: Omit<PermissionAuditEntry, 'id' | 'timestamp'>,
): StoredRbacData => {
  const existing = loadStoredRbacData();
  const sanitized = enforceImmutableGrants(config);
  const entry: PermissionAuditEntry = {
    ...auditEntry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  const payload: StoredRbacData = {
    version: RBAC_STORAGE_VERSION,
    config: sanitized,
    updatedAt: entry.timestamp,
    auditLog: [entry, ...(existing?.auditLog ?? [])].slice(0, RBAC_AUDIT_LOG_LIMIT),
  };

  window.localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearPermissionConfigStorage = (): void => {
  window.localStorage.removeItem(RBAC_STORAGE_KEY);
};

export const togglePermissionGrant = (
  config: PermissionConfigMap,
  permission: Permission,
  role: Role,
  granted: boolean,
): PermissionConfigMap => {
  const next = cloneConfig(config);
  const roles = new Set(next[permission]);

  if (granted) {
    roles.add(role);
  } else {
    roles.delete(role);
  }

  next[permission] = [...roles];
  return enforceImmutableGrants(next);
};

export const isImmutableGrant = (permission: Permission, role: Role): boolean =>
  IMMUTABLE_GRANTS[permission]?.includes(role) ?? false;
