import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrackerProject } from '../schemas/tracker.schema';

const downloadCsv = vi.fn();

vi.mock('@/shared/utils/exportCsv', () => ({
  downloadCsv: (...args: unknown[]) => downloadCsv(...args),
}));

import { exportTrackerToCsv } from './exportTracker';

const project = (overrides: Partial<TrackerProject> = {}): TrackerProject => ({
  id: 'p1',
  name: 'Alpha',
  pm: 'Thy',
  cm: ['Minh'],
  team: ['A', 'B'],
  totalSlides: 12,
  urgency: 'green',
  blocks: [],
  ...overrides,
});

describe('exportTrackerToCsv', () => {
  beforeEach(() => {
    downloadCsv.mockClear();
  });

  it('includes a Sales column and exports trimmed sales names', () => {
    exportTrackerToCsv(
      [
        project({ salesName: '  Lan  ' }),
        project({ id: 'p2', name: 'Beta', salesName: undefined }),
      ],
      '2026-11',
    );

    expect(downloadCsv).toHaveBeenCalledTimes(1);
    const [filename, headers, rows] = downloadCsv.mock.calls[0] as [
      string,
      string[],
      (string | number)[][],
    ];
    expect(filename).toBe('project-tracker-2026-11.csv');
    expect(headers).toEqual(['Project', 'Sales', 'PM/CM', 'Team', 'Total']);
    expect(rows[0]?.[0]).toBe('Alpha');
    expect(rows[0]?.[1]).toBe('Lan');
    expect(rows[1]?.[0]).toBe('Beta');
    expect(rows[1]?.[1]).toBe('');
  });
});
