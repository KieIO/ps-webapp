export const TASK_SCORE_GROUP_COLOR_KEYS = [
  'implementation',
  'quality_control',
  'edit_others',
  'accent_teal',
  'accent_purple',
] as const;

export type TaskScoreGroupColorKey = (typeof TASK_SCORE_GROUP_COLOR_KEYS)[number];

export const slugifyTaskScoreGroupCode = (label: string): string => {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return slug || 'group';
};

export const pickTaskScoreGroupColorKey = (index: number): TaskScoreGroupColorKey =>
  TASK_SCORE_GROUP_COLOR_KEYS[index % TASK_SCORE_GROUP_COLOR_KEYS.length];
