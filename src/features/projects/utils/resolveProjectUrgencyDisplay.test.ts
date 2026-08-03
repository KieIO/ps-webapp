import { describe, expect, it } from 'vitest';
import { resolveProjectUrgencyDisplay } from './resolveProjectUrgencyDisplay';

describe('resolveProjectUrgencyDisplay', () => {
  it('returns locked color for active projects', () => {
    expect(
      resolveProjectUrgencyDisplay({
        urgency: 'green',
        status: 'in_progress',
        endDate: '2020-01-01',
      }),
    ).toBe('green');
  });

  it('calculates from deadline when urgency is auto', () => {
    expect(
      resolveProjectUrgencyDisplay({
        urgency: 'auto',
        status: 'in_progress',
        endDate: '2020-01-01',
      }),
    ).toBe('red');
  });

  it('forces gray for finished projects even when a locked color is stored', () => {
    expect(
      resolveProjectUrgencyDisplay({
        urgency: 'red',
        status: 'finish',
        endDate: '2030-01-01',
      }),
    ).toBe('gray');
  });

  it('forces gray for cancelled projects without overwriting the need for auto restore', () => {
    expect(
      resolveProjectUrgencyDisplay({
        urgency: 'auto',
        status: 'cancel',
        endDate: '2020-01-01',
      }),
    ).toBe('gray');
  });
});
