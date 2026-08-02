import { describe, expect, it } from 'vitest';
import {
  hasPersonUserId,
  mergePersonOptions,
  resolvePersonFromForm,
  resolvePersonRef,
} from './personRef';

describe('mergePersonOptions', () => {
  it('adds the current project head when options are missing it', () => {
    expect(mergePersonOptions([], { code: 'PO.003', name: 'Tran Thi Binh' })).toEqual([
      { code: 'PO.003', name: 'Tran Thi Binh' },
    ]);
  });

  it('replaces broken option names with the project value', () => {
    expect(
      mergePersonOptions([{ code: 'PO.003', name: '' }], { code: 'PO.003', name: 'Tran Thi Binh' }),
    ).toEqual([{ code: 'PO.003', name: 'Tran Thi Binh' }]);
  });
});

describe('resolvePersonRef', () => {
  const options = [
    { code: 'PO.003', name: 'Tran Thi Binh', userId: 'usr-002' },
    { code: 'PO.031', name: 'Nguyen Duong Tri', userId: 'usr-031' },
  ];

  it('resolves name and userId from options by code', () => {
    expect(resolvePersonRef('PO.003', options)).toEqual({
      code: 'PO.003',
      name: 'Tran Thi Binh',
      userId: 'usr-002',
    });
  });

  it('falls back to project values when options are still loading', () => {
    expect(
      resolvePersonRef('PO.031', [], {
        code: 'PO.031',
        name: 'Nguyen Duong Tri',
        userId: 'usr-031',
      }),
    ).toEqual({
      code: 'PO.031',
      name: 'Nguyen Duong Tri',
      userId: 'usr-031',
    });
  });

  it('prefers option userId over a partial form fallback', () => {
    expect(resolvePersonRef('PO.003', options, { code: 'PO.003', name: '' })).toEqual({
      code: 'PO.003',
      name: 'Tran Thi Binh',
      userId: 'usr-002',
    });
  });
});

describe('resolvePersonFromForm', () => {
  const options = [{ code: 'PO.003', name: 'Tran Thi Binh', userId: 'usr-002' }];

  it('keeps userId from the full form store when finish values only have code', () => {
    expect(
      resolvePersonFromForm(
        { code: 'PO.003', name: '' },
        { code: 'PO.003', name: 'Tran Thi Binh', userId: 'usr-002' },
        [],
      ),
    ).toEqual({
      code: 'PO.003',
      name: 'Tran Thi Binh',
      userId: 'usr-002',
    });
  });

  it('uses project fallback when form store is empty', () => {
    expect(
      resolvePersonFromForm(undefined, undefined, options, {
        code: 'PO.003',
        name: 'Tran Thi Binh',
        userId: 'usr-002',
      }),
    ).toEqual({
      code: 'PO.003',
      name: 'Tran Thi Binh',
      userId: 'usr-002',
    });
  });
});

describe('hasPersonUserId', () => {
  it('returns false for missing or blank userId', () => {
    expect(hasPersonUserId({ code: 'PO.003', name: 'A' })).toBe(false);
    expect(hasPersonUserId({ code: 'PO.003', name: 'A', userId: '  ' })).toBe(false);
  });

  it('returns true when userId is present', () => {
    expect(hasPersonUserId({ code: 'PO.003', name: 'A', userId: 'usr-002' })).toBe(true);
  });
});
