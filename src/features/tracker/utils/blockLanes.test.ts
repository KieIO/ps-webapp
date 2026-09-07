import { describe, expect, it } from 'vitest';
import { layoutProjectBlocks } from './blockLanes';
import type { TrackerBlock } from '../types';

const block = (
  partial: Pick<TrackerBlock, 'start' | 'end' | 'label'> & Partial<TrackerBlock>,
): TrackerBlock => ({
  type: 'pending',
  ...partial,
});

describe('layoutProjectBlocks', () => {
  it('keeps the project bar above early tasks that start sooner', () => {
    const projectName = 'Sanofi Meninga';
    const blocks: TrackerBlock[] = [
      block({ start: '2026-08-04', end: '2026-08-31', label: projectName, type: 'pending' }),
      block({ start: '2026-08-03', end: '2026-08-03', label: 'DA', type: 'completed' }),
      block({ start: '2026-08-05', end: '2026-08-05', label: 'Slides', type: 'active' }),
    ];

    const layout = layoutProjectBlocks(blocks, projectName);
    const byLabel = Object.fromEntries(layout.blocks.map((entry) => [entry.label, entry.lane]));

    expect(byLabel[projectName]).toBe(0);
    expect(byLabel.DA).toBeGreaterThan(0);
    expect(byLabel.Slides).toBeGreaterThan(0);
  });

  it('packs overlapping tasks below the project bar without colliding', () => {
    const projectName = 'Standard';
    const blocks: TrackerBlock[] = [
      block({ start: '2026-08-01', end: '2026-08-31', label: projectName, type: 'active' }),
      block({ start: '2026-08-03', end: '2026-08-03', label: 'A', type: 'pending' }),
      block({ start: '2026-08-03', end: '2026-08-03', label: 'B', type: 'completed' }),
    ];

    const layout = layoutProjectBlocks(blocks, projectName);
    const projectLane = layout.blocks.find((entry) => entry.label === projectName)?.lane;
    const taskLanes = layout.blocks
      .filter((entry) => entry.label !== projectName)
      .map((entry) => entry.lane);

    expect(projectLane).toBe(0);
    expect(taskLanes.every((lane) => lane > 0)).toBe(true);
    expect(new Set(taskLanes).size).toBe(2);
  });
});
