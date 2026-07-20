import { DEPARTMENT_LABELS } from '@/features/projects/constants';
import type { ProjectDepartment } from '@/features/projects/schemas/project.schema';
import { useDepartmentList } from './useDepartmentList';
import { useMemo } from 'react';

export const isKnownDepartment = (code: string): code is ProjectDepartment =>
  code in DEPARTMENT_LABELS;

export const getDepartmentLabel = (
  code: string | null | undefined,
  labelByCode?: Record<string, string>,
): string => {
  if (!code) return '';
  if (labelByCode?.[code]) return labelByCode[code];
  if (isKnownDepartment(code)) return DEPARTMENT_LABELS[code];
  return code;
};

export const useDepartmentOptions = (options?: { enabled?: boolean }) => {
  const { data, isLoading } = useDepartmentList(options);

  const selectOptions = useMemo(
    () =>
      (data?.items ?? []).map((department) => ({
        value: department.code,
        label: department.name,
      })),
    [data?.items],
  );

  const labelByCode = useMemo(
    () => Object.fromEntries((data?.items ?? []).map((d) => [d.code, d.name])),
    [data?.items],
  );

  return {
    options: selectOptions,
    labelByCode,
    isLoading,
    items: data?.items ?? [],
  };
};
