import { TRACKER_ROW_HEIGHT } from '../constants';
import type { TrackerProject } from '../schemas/tracker.schema';
import type { ProjectRowLayout } from './blockLanes';

/** Rough average character width at tracker label font sizes (px). */
const AVG_CHAR_WIDTH = 6.5;

const NAME_CONTENT_WIDTH = 148;
const TEAM_CONTENT_WIDTH = 106;
const CELL_VERTICAL_PADDING = 12;
const NAME_LINE_HEIGHT = 16.8;
const PM_LINE_HEIGHT = 14.4;
const TEAM_LINE_HEIGHT = 13.1;
const TEAM_TEXT_GAP = 2;

function estimateLineCount(text: string, contentWidth: number): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const charsPerLine = Math.max(6, Math.floor(contentWidth / AVG_CHAR_WIDTH));
  return Math.ceil(trimmed.length / charsPerLine);
}

/** Minimum row height so left-panel labels can wrap without clipping. */
export function estimateTrackerLeftRowHeight(project: TrackerProject): number {
  const nameLines = Math.max(1, estimateLineCount(project.name, NAME_CONTENT_WIDTH));
  const pmLines = Math.max(1, estimateLineCount(project.pm, TEAM_CONTENT_WIDTH));
  const teamLines = estimateLineCount(project.team.join(', '), TEAM_CONTENT_WIDTH);

  const nameHeight = CELL_VERTICAL_PADDING + nameLines * NAME_LINE_HEIGHT;
  const teamHeight =
    CELL_VERTICAL_PADDING +
    pmLines * PM_LINE_HEIGHT +
    (teamLines > 0 ? TEAM_TEXT_GAP + teamLines * TEAM_LINE_HEIGHT : 0);

  return Math.max(TRACKER_ROW_HEIGHT, nameHeight, teamHeight);
}

export function mergeProjectRowLayout(
  blockLayout: ProjectRowLayout,
  project: TrackerProject,
): ProjectRowLayout {
  const rowHeight = Math.max(blockLayout.rowHeight, estimateTrackerLeftRowHeight(project));
  return { ...blockLayout, rowHeight };
}
