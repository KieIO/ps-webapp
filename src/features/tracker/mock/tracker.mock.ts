import { mockDelay } from '@/shared/mock/mockDelay';
import { TRACKER_OFF_DAYS } from './offDays.data';
import { TRACKER_PROJECTS } from './tracker.data';
import type { TrackerResponse } from '../schemas/tracker.schema';
import { withAggregatedTrackerBlocks } from '../utils/aggregateAdminBlocks';

export const mockGetTracker = async (): Promise<TrackerResponse> => {
  await mockDelay();
  const projects = withAggregatedTrackerBlocks(TRACKER_PROJECTS).map((project) => ({
    ...project,
    milestones: project.milestones ?? [],
  }));

  return {
    projects,
    offDays: TRACKER_OFF_DAYS,
  };
};
