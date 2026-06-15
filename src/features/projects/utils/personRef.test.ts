import { describe, expect, it } from 'vitest';
import { mergePersonOptions, resolvePersonRef } from './personRef';

describe('mergePersonOptions', () => {
  it('adds the current project head when options are missing it', () => {
    expect(
      mergePersonOptions([], { code: 'PO.003', name: 'Tran Thi Binh' }),
    ).toEqual([{ code: 'PO.003', name: 'Tran Thi Binh' }]);
  });

  it('replaces broken option names with the project value', () => {
    expect(
      mergePersonOptions(
        [{ code: 'PO.003', name: '' }],
        { code: 'PO.003', name: 'Tran Thi Binh' },
      ),
    ).toEqual([{ code: 'PO.003', name: 'Tran Thi Binh' }]);
  });
});

describe('resolvePersonRef', () => {
  const options = [
    { code: 'PO.003', name: 'Tran Thi Binh' },
    { code: 'PO.031', name: 'Nguyen Duong Tri' },
  ];

  it('resolves name from options by code', () => {
    expect(resolvePersonRef('PO.003', options)).toEqual({
      code: 'PO.003',
      name: 'Tran Thi Binh',
    });
  });

  it('falls back to project values when options are still loading', () => {
    expect(
      resolvePersonRef('PO.031', [], { code: 'PO.031', name: 'Nguyen Duong Tri' }),
    ).toEqual({
      code: 'PO.031',
      name: 'Nguyen Duong Tri',
    });
  });
});
