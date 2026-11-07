import { describe, expect, it } from 'vitest';
import { canEditOvertimeRequest, overtimeEditDisabledReason } from './constants';

describe('overtime edit access', () => {
  it('allows only the requester while pending', () => {
    expect(
      canEditOvertimeRequest({
        status: 'pending',
        requestedByUserId: 'u1',
        actorUserId: 'u1',
      }),
    ).toBe(true);
    expect(
      canEditOvertimeRequest({
        status: 'pending',
        requestedByUserId: 'u1',
        actorUserId: 'u2',
      }),
    ).toBe(false);
    expect(
      canEditOvertimeRequest({
        status: 'approved',
        requestedByUserId: 'u1',
        actorUserId: 'u1',
      }),
    ).toBe(false);
  });

  it('explains why non-requester cannot edit pending', () => {
    expect(
      overtimeEditDisabledReason({
        status: 'pending',
        requestedByUserId: 'u1',
        actorUserId: 'u2',
      }),
    ).toBe('Chỉ người tạo OT request mới chỉnh sửa được');
  });
});
