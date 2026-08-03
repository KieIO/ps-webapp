import { parseTaskScoreName } from '@/features/tasks/utils/taskScoreName';

/** Prefer explicit task type; otherwise use base name from catalog name (e.g. "Slides 1" → "Slides"). */
export function resolveTaskType(taskType: string | null | undefined, name: string): string {
  const trimmed = taskType?.trim() ?? '';
  if (trimmed) return trimmed;
  return parseTaskScoreName(name).baseName;
}
