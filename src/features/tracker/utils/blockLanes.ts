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

export function layoutProjectBlocks(blocks: TrackerBlock[]): ProjectRowLayout {
  if (blocks.length === 0) {
    return { blocks: [], rowHeight: TRACKER_ROW_HEIGHT, laneCount: 0 };
  }

  const sorted = blocks
    .map((block, index) => ({ block, index }))
    .sort((a, b) => {
      const startCmp = a.block.start.localeCompare(b.block.start);
      if (startCmp !== 0) return startCmp;
      return a.block.end.localeCompare(b.block.end);
    });

  const laneEnds: string[] = [];
  const lanes = new Array<number>(blocks.length);

  for (const { block, index } of sorted) {
    let lane = laneEnds.findIndex((laneEnd) => block.start > laneEnd);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.end);
    } else {
      laneEnds[lane] = block.end;
    }
    lanes[index] = lane;
  }

  const laneCount = laneEnds.length;
  const rowHeight = Math.max(
    TRACKER_ROW_HEIGHT,
    TRACKER_BLOCK_PADDING * 2 +
      laneCount * TRACKER_BLOCK_HEIGHT +
      Math.max(0, laneCount - 1) * TRACKER_BLOCK_GAP,
  );

  const laidOutBlocks: LaidOutBlock[] = blocks.map((block, index) => ({
    ...block,
    lane: lanes[index] ?? 0,
  }));

  return { blocks: laidOutBlocks, rowHeight, laneCount };
}

export function getBlockTop(lane: number): number {
  return TRACKER_BLOCK_PADDING + lane * (TRACKER_BLOCK_HEIGHT + TRACKER_BLOCK_GAP);
}
