import { describe, expect, it } from 'vitest';
import { defaultSplitChildName, isQaTaskName, parseTaskScoreName } from './taskScoreName';

describe('isQaTaskName', () => {
  it('detects QA task names', () => {
    expect(isQaTaskName('QA')).toBe(true);
    expect(isQaTaskName('QA 3')).toBe(true);
    expect(isQaTaskName('Slides')).toBe(false);
  });
});

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
