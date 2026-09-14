import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';

const RESET_TIMEOUT_MS = 120_000;

export type DatabaseResetMode = 'seed' | 'empty';

export const settingsApi = {
  resetDatabase: async (
    mode: DatabaseResetMode = 'seed',
  ): Promise<{ message: string; mode: string }> => {
    const response = await api
      .post('/settings/database/reset', { mode }, { timeout: RESET_TIMEOUT_MS })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to reset database'));
      });
    return response.data as { message: string; mode: string };
  },
};
