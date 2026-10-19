import type { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { isApiForbiddenError } from './apiError';

const axiosLike = (status: number, data?: { code?: string; message?: string }): AxiosError => {
  const error = new Error(data?.message ?? 'Request failed') as AxiosError;
  error.isAxiosError = true;
  error.response = {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  };
  return error;
};

describe('isApiForbiddenError', () => {
  it('detects axios 403', () => {
    expect(
      isApiForbiddenError(
        axiosLike(403, { code: 'FORBIDDEN', message: 'You do not have access to this task' }),
      ),
    ).toBe(true);
  });

  it('detects FORBIDDEN code', () => {
    expect(isApiForbiddenError(axiosLike(403, { code: 'FORBIDDEN' }))).toBe(true);
  });

  it('detects permission wording on plain Error (mock path)', () => {
    expect(isApiForbiddenError(new Error('You do not have permission to view this task'))).toBe(
      true,
    );
    expect(isApiForbiddenError(new Error('Bạn không có quyền xem task này'))).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isApiForbiddenError(new Error('Task not found'))).toBe(false);
    expect(isApiForbiddenError(axiosLike(404, { message: 'Task not found' }))).toBe(false);
    expect(isApiForbiddenError(null)).toBe(false);
    expect(isApiForbiddenError('nope')).toBe(false);
  });
});
