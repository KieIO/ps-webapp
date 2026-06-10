/**
 * Project Tracker API client (calendar view).
 * Backend contract: docs/TRACKER_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import { mockGetTracker } from './mock/tracker.mock';
import { TrackerResponseSchema, type TrackerResponse } from './schemas/tracker.schema';

export const trackerApi = {
  getData: async (): Promise<TrackerResponse> => {
    if (env.useTrackerMock) {
      return TrackerResponseSchema.parse(await mockGetTracker());
    }

    const response = await api.get('/tracker');
    return TrackerResponseSchema.parse(response.data);
  },
};
