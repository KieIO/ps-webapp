import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from './permissions';
import {
  assertRbacMatrixCoverage,
  collectActiveMatrixPermissionKeys,
  getMatrixCoverageReport,
  MATRIX_PERMISSION_COVERAGE,
} from './rbacCoverage';

describe('rbacCoverage', () => {
  it('covers every PERMISSIONS key in active matrix modules', () => {
    const report = getMatrixCoverageReport();
    expect(report.uncovered).toEqual([]);
    expect(report.unknown).toEqual([]);
  });

  it('keeps MATRIX_PERMISSION_COVERAGE in sync with PERMISSIONS', () => {
    const permissionKeys = Object.keys(PERMISSIONS).sort();
    expect([...MATRIX_PERMISSION_COVERAGE].sort()).toEqual(permissionKeys);
  });

  it('collects the same keys as MATRIX_PERMISSION_COVERAGE', () => {
    expect(collectActiveMatrixPermissionKeys().sort()).toEqual(
      [...MATRIX_PERMISSION_COVERAGE].sort(),
    );
  });

  it('passes assertRbacMatrixCoverage without throwing', () => {
    expect(() => assertRbacMatrixCoverage()).not.toThrow();
  });
});
