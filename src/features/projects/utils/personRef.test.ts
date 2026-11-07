import { describe, expect, it } from 'vitest';
import {
  findPersonOption,
  hasPersonUserId,
  mergePersonOptions,
  personSelectValue,
  resolvePersonFromForm,
  resolvePersonRef,
  toPersonSelectOptions,
} from './personRef';

describe('personSelectValue', () => {
  it('prefers userId over code', () => {
    expect(personSelectValue({ code: 'ADMIN', name: 'Dev Admin', userId: 'u-dev' })).toBe('u-dev');
    expect(personSelectValue({ code: 'ADMIN', name: 'Admin' })).toBe('ADMIN');
  });
});

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

  it('keeps two people that share an email-derived code but different userIds', () => {
    const options = [
      { code: 'ADMIN', name: 'Admin', userId: 'u-admin' },
      { code: 'ADMIN', name: 'Dev Admin', userId: 'u-dev' },
    ];
    const merged = mergePersonOptions(options, {
      code: 'ADMIN',
      name: 'Dev Admin',
      userId: 'u-dev',
    });
    expect(merged).toHaveLength(2);
    expect(
      toPersonSelectOptions(merged)
        .map((entry) => entry.value)
        .sort(),
    ).toEqual(['u-admin', 'u-dev']);
  });
});

describe('resolvePersonRef', () => {
  const options = [
    { code: 'ADMIN', name: 'Admin', userId: 'u-admin' },
    { code: 'ADMIN', name: 'Dev Admin', userId: 'u-dev' },
    { code: 'PO.031', name: 'Nguyen Duong Tri', userId: 'usr-031' },
  ];

  it('resolves by userId when codes collide', () => {
    expect(resolvePersonRef('u-dev', options)).toEqual({
      code: 'ADMIN',
      name: 'Dev Admin',
      userId: 'u-dev',
    });
    expect(resolvePersonRef('u-admin', options)).toEqual({
      code: 'ADMIN',
      name: 'Admin',
      userId: 'u-admin',
    });
  });

  it('still resolves legacy code keys when unique', () => {
    expect(resolvePersonRef('PO.031', options)).toEqual({
      code: 'PO.031',
      name: 'Nguyen Duong Tri',
      userId: 'usr-031',
    });
  });

  it('falls back to project values when options are still loading', () => {
    expect(
      resolvePersonRef('usr-031', [], {
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
});

describe('findPersonOption', () => {
  it('matches userId before code', () => {
    const options = [
      { code: 'ADMIN', name: 'Admin', userId: 'u-admin' },
      { code: 'ADMIN', name: 'Dev Admin', userId: 'u-dev' },
    ];
    expect(findPersonOption(options, 'u-dev')?.name).toBe('Dev Admin');
  });
});

describe('resolvePersonFromForm', () => {
  const options = [{ code: 'PO.003', name: 'Tran Thi Binh', userId: 'usr-002' }];

  it('keeps person from the full form store when finish values only have userId', () => {
    expect(
      resolvePersonFromForm(
        { code: '', name: '', userId: 'usr-002' },
        { code: 'PO.003', name: 'Tran Thi Binh', userId: 'usr-002' },
        options,
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
