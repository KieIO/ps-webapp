import { mockDelay } from '@/shared/mock/mockDelay';
import { TRACKER_V2_OFF_DAYS } from './offDays.data';
import { TRACKER_V2_PROJECTS } from './trackerV2.data';
import type { TrackerV2Response } from '../schemas/trackerV2.schema';

export const mockGetTrackerV2 = async (): Promise<TrackerV2Response> => {
  await mockDelay();
  return {
    projects: TRACKER_V2_PROJECTS,
    offDays: TRACKER_V2_OFF_DAYS,
  };
};
