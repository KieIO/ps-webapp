import { describe, expect, it } from 'vitest';
import type { TrackerProject } from '../schemas/tracker.schema';
import { aggregateAdminTrackerBlocks, withAdminAggregatedBlocks } from './aggregateAdminBlocks';

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
        { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'pending', band: 1 },
        { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'active', band: 0 },
      ],
    });

    const result = aggregateAdminTrackerBlocks(project);
    expect(result[0]).toMatchObject({
      label: 'Acme Deck',
      start: '2026-05-01',
      end: '2026-05-10',
    });
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ label: 'DA ×2', type: 'pending' });
  });

  it('merges same-range labels case-insensitively and keeps first casing', () => {
    const project = baseProject({
      blocks: [
        { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'completed', band: 0 },
        { start: '2026-05-05', end: '2026-05-05', label: 'da', type: 'pending', band: 1 },
        { start: '2026-05-05', end: '2026-05-05', label: 'Da', type: 'active', band: 0 },
      ],
    });

    const result = aggregateAdminTrackerBlocks(project);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('DA ×3');
    expect(result[0].type).toBe('pending'); // decline < pending < active < completed
  });

  it('does not merge different date ranges or different names', () => {
    const project = baseProject({
      blocks: [
        { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'pending', band: 0 },
        { start: '2026-05-06', end: '2026-05-06', label: 'DA', type: 'pending', band: 0 },
        { start: '2026-05-05', end: '2026-05-05', label: 'Slides', type: 'active', band: 1 },
      ],
    });

    const labels = aggregateAdminTrackerBlocks(project).map((b) => `${b.start}:${b.label}`);
    expect(labels).toEqual(['2026-05-05:DA', '2026-05-05:Slides', '2026-05-06:DA']);
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

  it('leaves a single matching block unlabeled with ×N', () => {
    const project = baseProject({
      blocks: [{ start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'active', band: 0 }],
    });
    expect(aggregateAdminTrackerBlocks(project)[0].label).toBe('DA');
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

describe('withAdminAggregatedBlocks', () => {
  it('returns the same array reference when not admin', () => {
    const projects = [baseProject()];
    expect(withAdminAggregatedBlocks(projects, false)).toBe(projects);
  });

  it('maps projects when admin', () => {
    const projects = [
      baseProject({
        blocks: [
          { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'pending', band: 0 },
          { start: '2026-05-05', end: '2026-05-05', label: 'DA', type: 'active', band: 1 },
        ],
      }),
    ];
    const next = withAdminAggregatedBlocks(projects, true);
    expect(next).not.toBe(projects);
    expect(next[0].blocks[0].label).toBe('DA ×2');
    expect(projects[0].blocks).toHaveLength(2); // original untouched
  });
});
