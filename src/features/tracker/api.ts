/**
 * Project Tracker API client (calendar view).
 * Backend contract: docs/TRACKER_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import { mockGetTracker } from './mock/tracker.mock';
import { TrackerResponseSchema, type TrackerResponse } from './schemas/tracker.schema';

export type TrackerGetOptions = {
  /**
   * Mock-only: mirror backend admin aggregation (`Name ×N` same-day pills).
   * Ignored for the real API — the server aggregates from the auth role.
   */
  aggregateTaskNames?: boolean;
};

export const trackerApi = {
  getData: async (options?: TrackerGetOptions): Promise<TrackerResponse> => {
    if (env.useTrackerMock) {
      return TrackerResponseSchema.parse(
        await mockGetTracker({ aggregateTaskNames: Boolean(options?.aggregateTaskNames) }),
      );
    }

    const response = await api.get('/tracker');
    return TrackerResponseSchema.parse(response.data);
  },
};
