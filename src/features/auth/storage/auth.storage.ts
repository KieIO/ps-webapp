import { AUTH_STORAGE_KEY, AUTH_STORAGE_VERSION } from '../constants';
import { AuthUserSchema, type AuthUser } from '../schemas/auth.schema';

interface StoredAuthSession {
  version: typeof AUTH_STORAGE_VERSION;
  token: string;
  user: AuthUser;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const loadAuthSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const { version, token, user } = parsed as Partial<StoredAuthSession>;
    if (version !== AUTH_STORAGE_VERSION || typeof token !== 'string' || !token) {
      return null;
    }

    const userResult = AuthUserSchema.safeParse(user);
    if (!userResult.success) {
      return null;
    }

    return { token, user: userResult.data };
  } catch {
    return null;
  }
};

export const saveAuthSession = (session: AuthSession): void => {
  const payload: StoredAuthSession = {
    version: AUTH_STORAGE_VERSION,
    token: session.token,
    user: session.user,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
