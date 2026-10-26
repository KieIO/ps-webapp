import { describe, expect, it } from 'vitest';
import { defaultSplitChildName, parseTaskScoreName } from './taskScoreName';

describe('defaultSplitChildName', () => {
  it('uses the parent task type and drops a trailing catalog level', () => {
    expect(defaultSplitChildName('Slides')).toBe('Slides');
    expect(defaultSplitChildName('Slides 2')).toBe('Slides');
    expect(defaultSplitChildName('  DA  ')).toBe('DA');
    expect(defaultSplitChildName('Edit feedback DE')).toBe('Edit feedback DE');
    expect(defaultSplitChildName('   ')).toBe('');
    expect(parseTaskScoreName('Slides 12').level).toBe(12);
  });
});
