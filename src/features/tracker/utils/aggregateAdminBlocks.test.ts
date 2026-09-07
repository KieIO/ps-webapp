import { describe, expect, it } from 'vitest';
import type { TrackerProject } from '../schemas/tracker.schema';
import {
  aggregateAdminTrackerBlocks,
  inferOutputMetricFromTaskName,
  parseTrackerTaskBaseLabel,
  withAdminAggregatedBlocks,
} from './aggregateAdminBlocks';

const baseProject = (overrides: Partial<TrackerProject> = {}): TrackerProject => ({
  id: 'p1',
  name: 'Acme Deck',
  pm: 'Thy',
  cm: [],
  team: [],
  totalSlides: 10,
  urgency: 'green',
  blocks: [],
  ...overrides,
});

describe('aggregateAdminTrackerBlocks', () => {
  it('returns empty when there are no blocks', () => {
    expect(aggregateAdminTrackerBlocks(baseProject())).toEqual([]);
  });

  it('preserves project timeline bars (label === project name) without collapsing them', () => {
    const project = baseProject({
      blocks: [
        { start: '2026-05-01', end: '2026-05-10', label: 'Acme Deck', type: 'active', band: 0 },
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'DA',
          type: 'pending',
          band: 1,
          quantity: 1,
        },
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'DA',
          type: 'active',
          band: 0,
          quantity: 2,
        },
      ],
    });

    const result = aggregateAdminTrackerBlocks(project);
    expect(result[0]).toMatchObject({
      label: 'Acme Deck',
      start: '2026-05-01',
      end: '2026-05-10',
    });
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ label: '3 DA', type: 'pending', quantity: 3 });
  });

  it('merges same-range labels case-insensitively and keeps first casing', () => {
    const project = baseProject({
      blocks: [
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'DA',
          type: 'completed',
          band: 0,
          quantity: 1,
        },
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'da',
          type: 'pending',
          band: 1,
          quantity: 2,
        },
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'Da',
          type: 'active',
          band: 0,
          quantity: 3,
        },
      ],
    });

    const result = aggregateAdminTrackerBlocks(project);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('6 DA');
    expect(result[0].type).toBe('pending'); // decline < pending < active < completed
  });

  it('does not merge different date ranges or different names', () => {
    const project = baseProject({
      blocks: [
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'DA',
          type: 'pending',
          band: 0,
          quantity: 2,
        },
        {
          start: '2026-05-06',
          end: '2026-05-06',
          label: 'DA',
          type: 'pending',
          band: 0,
          quantity: 3,
        },
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'Slides',
          type: 'active',
          band: 1,
          quantity: 10,
        },
      ],
    });

    const labels = aggregateAdminTrackerBlocks(project).map((b) => `${b.start}:${b.label}`);
    expect(labels).toEqual(['2026-05-05:2 DA', '2026-05-05:10 Slides', '2026-05-06:3 DA']);
  });

  it('normalizes blank labels to an em dash', () => {
    const project = baseProject({
      blocks: [
        { start: '2026-05-05', end: '2026-05-05', label: '  ', type: 'pending', band: 0 },
        { start: '2026-05-05', end: '2026-05-05', label: '', type: 'active', band: 1 },
      ],
    });

    expect(aggregateAdminTrackerBlocks(project)).toEqual([
      expect.objectContaining({ label: '— ×2', type: 'pending' }),
    ]);
  });

  it('formats a single block with quantity as "N Label"', () => {
    const project = baseProject({
      blocks: [
        {
          start: '2026-05-05',
          end: '2026-05-05',
          label: 'DA',
          type: 'active',
          band: 0,
          quantity: 5,
        },
      ],
    });
    expect(aggregateAdminTrackerBlocks(project)[0].label).toBe('5 DA');
  });

  it('is safe if already-aggregated labels are passed again (no further × merge with raw names)', () => {
    const project = baseProject({
      blocks: [
        { start: '2026-05-05', end: '2026-05-05', label: 'DA ×2', type: 'pending', band: 0 },
        { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'active', band: 1 },
      ],
    });
    const labels = aggregateAdminTrackerBlocks(project)
      .map((b) => b.label)
      .sort();
    // Different labels after first pass → stay separate (avoids ×× corruption)
    expect(labels).toEqual(['DA', 'DA ×2']);
  });
});

describe('parseTrackerTaskBaseLabel', () => {
  it('strips quantity prefix when quantity is known', () => {
    expect(parseTrackerTaskBaseLabel('122 Slides', 122)).toBe('Slides');
    expect(parseTrackerTaskBaseLabel('5 DA', 5)).toBe('DA');
  });

  it('strips ×count suffix', () => {
    expect(parseTrackerTaskBaseLabel('Slides ×4')).toBe('Slides');
  });

  it('passes plain task names through', () => {
    expect(parseTrackerTaskBaseLabel('Edit Fee')).toBe('Edit Fee');
    expect(parseTrackerTaskBaseLabel('110 Review')).toBe('110 Review');
    expect(parseTrackerTaskBaseLabel('4 Edit Fee')).toBe('4 Edit Fee');
  });

  it('does not guess a numeric prefix when quantity does not match', () => {
    expect(parseTrackerTaskBaseLabel('110 Review', 122)).toBe('110 Review');
  });
});

describe('inferOutputMetricFromTaskName', () => {
  it('maps DA variants to creative_da', () => {
    expect(inferOutputMetricFromTaskName('DA')).toBe('creative_da');
    expect(inferOutputMetricFromTaskName('Edit DA')).toBe('creative_da');
    expect(inferOutputMetricFromTaskName('Rework DA')).toBe('creative_da');
  });

  it('defaults other task names to project_slides', () => {
    expect(inferOutputMetricFromTaskName('Slides')).toBe('project_slides');
    expect(inferOutputMetricFromTaskName('Edit Fee')).toBe('project_slides');
  });
});

describe('withAdminAggregatedBlocks', () => {
  it('returns the same array reference when not admin', () => {
    const projects = [baseProject()];
    expect(withAdminAggregatedBlocks(projects, false)).toBe(projects);
  });

  it('maps projects when admin', () => {
    const projects = [
      baseProject({
        blocks: [
          {
            start: '2026-05-05',
            end: '2026-05-05',
            label: 'DA',
            type: 'pending',
            band: 0,
            quantity: 1,
          },
          {
            start: '2026-05-05',
            end: '2026-05-05',
            label: 'DA',
            type: 'active',
            band: 1,
            quantity: 2,
          },
        ],
      }),
    ];
    const next = withAdminAggregatedBlocks(projects, true);
    expect(next).not.toBe(projects);
    expect(next[0].blocks[0].label).toBe('3 DA');
    expect(projects[0].blocks).toHaveLength(2); // original untouched
  });
});
