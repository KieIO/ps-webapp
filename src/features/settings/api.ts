import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';

export const settingsApi = {
  resetDatabase: async (): Promise<{ message: string }> => {
    const response = await api.post('/settings/database/reset').catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Failed to reset database'));
    });
    return response.data as { message: string };
  },
};
