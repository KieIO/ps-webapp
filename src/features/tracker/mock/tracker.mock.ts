import { mockDelay } from '@/shared/mock/mockDelay';
import { TRACKER_OFF_DAYS } from './offDays.data';
import { TRACKER_PROJECTS } from './tracker.data';
import type { TrackerResponse } from '../schemas/tracker.schema';

export const mockGetTracker = async (): Promise<TrackerResponse> => {
  await mockDelay();
  return {
    projects: TRACKER_PROJECTS,
    offDays: TRACKER_OFF_DAYS,
  };
};
