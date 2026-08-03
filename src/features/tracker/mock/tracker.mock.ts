import { mockDelay } from '@/shared/mock/mockDelay';
import { TRACKER_OFF_DAYS } from './offDays.data';
import { TRACKER_PROJECTS } from './tracker.data';
import type { TrackerResponse } from '../schemas/tracker.schema';
import { withAdminAggregatedBlocks } from '../utils/aggregateAdminBlocks';

export type MockGetTrackerOptions = {
  /** When true, collapse same-day same-name task blocks like the admin API. */
  aggregateTaskNames?: boolean;
};

export const mockGetTracker = async (
  options: MockGetTrackerOptions = {},
): Promise<TrackerResponse> => {
  await mockDelay();
  return {
    projects: withAdminAggregatedBlocks(TRACKER_PROJECTS, Boolean(options.aggregateTaskNames)),
    offDays: TRACKER_OFF_DAYS,
  };
};
