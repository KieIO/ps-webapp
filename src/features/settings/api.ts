import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';

const RESET_TIMEOUT_MS = 120_000;

export const settingsApi = {
  resetDatabase: async (): Promise<{ message: string }> => {
    const response = await api
      .post('/settings/database/reset', undefined, { timeout: RESET_TIMEOUT_MS })
      .catch((error: unknown) => {
        throw new Error(getApiErrorMessage(error, 'Failed to reset database'));
      });
    return response.data as { message: string };
  },
};
