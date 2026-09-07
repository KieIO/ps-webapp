import {
  TRACKER_BLOCK_GAP,
  TRACKER_BLOCK_HEIGHT,
  TRACKER_BLOCK_PADDING,
  TRACKER_ROW_HEIGHT,
} from '../constants';
import type { TrackerBlock } from '../types';

export interface LaidOutBlock extends TrackerBlock {
  lane: number;
}

export interface ProjectRowLayout {
  blocks: LaidOutBlock[];
  rowHeight: number;
  laneCount: number;
}

const packIntoLanes = (
  items: ReadonlyArray<{ block: TrackerBlock; index: number }>,
): { lanes: number[]; laneCount: number } => {
  const sorted = [...items].sort((a, b) => {
    const startCmp = a.block.start.localeCompare(b.block.start);
    if (startCmp !== 0) return startCmp;
    return a.block.end.localeCompare(b.block.end);
  });

  const laneEnds: string[] = [];
  const lanesByIndex = new Map<number, number>();

  for (const { block, index } of sorted) {
    let lane = laneEnds.findIndex((laneEnd) => block.start > laneEnd);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.end);
    } else {
      laneEnds[lane] = block.end;
    }
    lanesByIndex.set(index, lane);
  }

  return {
    lanes: items.map(({ index }) => lanesByIndex.get(index) ?? 0),
    laneCount: laneEnds.length,
  };
};

/**
 * Stack project timeline bar(s) on top, then pack task pills below.
 * Without this, sorting by start date lets early tasks claim lane 0 and push the
 * long project bar underneath — which looks inconsistent across rows.
 */
export function layoutProjectBlocks(
  blocks: TrackerBlock[],
  projectName?: string,
): ProjectRowLayout {
  if (blocks.length === 0) {
    return { blocks: [], rowHeight: TRACKER_ROW_HEIGHT, laneCount: 0 };
  }

  const normalizedName = projectName?.trim();
  const projectBars: { block: TrackerBlock; index: number }[] = [];
  const taskBlocks: { block: TrackerBlock; index: number }[] = [];

  blocks.forEach((block, index) => {
    if (normalizedName && block.label === normalizedName) {
      projectBars.push({ block, index });
    } else {
      taskBlocks.push({ block, index });
    }
  });

  // No identifiable project bar — keep legacy single-pass packing.
  if (projectBars.length === 0) {
    const packed = packIntoLanes(blocks.map((block, index) => ({ block, index })));
    const laneCount = packed.laneCount;
    const rowHeight = Math.max(
      TRACKER_ROW_HEIGHT,
      TRACKER_BLOCK_PADDING * 2 +
        laneCount * TRACKER_BLOCK_HEIGHT +
        Math.max(0, laneCount - 1) * TRACKER_BLOCK_GAP,
    );
    return {
      blocks: blocks.map((block, index) => ({
        ...block,
        lane: packed.lanes[index] ?? 0,
      })),
      rowHeight,
      laneCount,
    };
  }

  const projectPacked = packIntoLanes(projectBars);
  const taskPacked = packIntoLanes(taskBlocks);
  const taskLaneOffset = projectPacked.laneCount;

  const lanes = new Array<number>(blocks.length);
  projectBars.forEach(({ index }, i) => {
    lanes[index] = projectPacked.lanes[i] ?? 0;
  });
  taskBlocks.forEach(({ index }, i) => {
    lanes[index] = taskLaneOffset + (taskPacked.lanes[i] ?? 0);
  });

  const laneCount = taskLaneOffset + taskPacked.laneCount;
  const rowHeight = Math.max(
    TRACKER_ROW_HEIGHT,
    TRACKER_BLOCK_PADDING * 2 +
      laneCount * TRACKER_BLOCK_HEIGHT +
      Math.max(0, laneCount - 1) * TRACKER_BLOCK_GAP,
  );

  return {
    blocks: blocks.map((block, index) => ({
      ...block,
      lane: lanes[index] ?? 0,
    })),
    rowHeight,
    laneCount,
  };
}

export function getBlockTop(lane: number): number {
  return TRACKER_BLOCK_PADDING + lane * (TRACKER_BLOCK_HEIGHT + TRACKER_BLOCK_GAP);
}
