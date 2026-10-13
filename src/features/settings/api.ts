import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import axios from 'axios';

const RESET_TIMEOUT_MS = 120_000;
const BACKUP_TIMEOUT_MS = 180_000;

export type DatabaseResetMode = 'seed' | 'empty';

async function blobErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const parsed = JSON.parse(text) as { message?: string };
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // fall through
    }
  }
  return getApiErrorMessage(error, fallback);
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function filenameFromContentDisposition(header: string | undefined): string | null {
  if (!header) return null;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      return utfMatch[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  return plainMatch?.[1]?.trim() || null;
}

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

  exportDatabase: async (): Promise<void> => {
    try {
      const response = await api.get('/settings/database/export', {
        responseType: 'blob',
        timeout: BACKUP_TIMEOUT_MS,
      });
      const blob = response.data as Blob;
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Export returned an empty file');
      }
      if (blob.type && blob.type.includes('application/json')) {
        const text = await blob.text();
        try {
          const parsed = JSON.parse(text) as { message?: string };
          throw new Error(parsed.message || 'Failed to export database');
        } catch (error) {
          if (error instanceof Error && error.message !== 'Failed to export database') {
            throw error;
          }
          throw new Error('Failed to export database');
        }
      }
      const filename =
        filenameFromContentDisposition(response.headers['content-disposition']) ||
        `pokeslide-db-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.zip`;
      triggerBrowserDownload(blob, filename);
    } catch (error: unknown) {
      throw new Error(await blobErrorMessage(error, 'Failed to export database'));
    }
  },

  importDatabase: async (file: File): Promise<{ message: string }> => {
    const form = new FormData();
    form.append('file', file);
    try {
      const response = await api.post('/settings/database/import', form, {
        timeout: BACKUP_TIMEOUT_MS,
        transformRequest: [
          (data, headers) => {
            // Drop default application/json so the runtime sets multipart boundary.
            if (data instanceof FormData && headers && typeof headers === 'object') {
              delete (headers as Record<string, unknown>)['Content-Type'];
            }
            return data;
          },
        ],
      });
      return response.data as { message: string };
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, 'Failed to import database'));
    }
  },
};
