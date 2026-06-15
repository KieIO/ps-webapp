import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const rethrowApiError = (error: unknown, fallback?: string): never => {
  throw new Error(getApiErrorMessage(error, fallback));
};
