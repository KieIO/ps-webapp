export type TaskNameVariant =
  | 'animation'
  | 'slides'
  | 'editFeedbackDe'
  | 'redoSlide'
  | 'da'
  | 'custom';

const TASK_NAME_VARIANT_MAP: Record<string, TaskNameVariant> = {
  animation: 'animation',
  slides: 'slides',
  'edit feedback de': 'editFeedbackDe',
  'redo slide': 'redoSlide',
  da: 'da',
};

export function getTaskNameVariant(taskName: string): TaskNameVariant {
  const normalized = taskName.trim().toLowerCase();
  return TASK_NAME_VARIANT_MAP[normalized] ?? 'custom';
}

/** Creative DA output — excluded from project “slides” quantity totals. */
export function isCreativeDaTaskName(taskName: string): boolean {
  const normalized = taskName.trim().toLowerCase().replace(/\s+/g, ' ');
  return getTaskNameVariant(taskName) === 'da' || /^(da|edit da|rework da)(\b|$)/u.test(normalized);
}

/** Project slides-style output (anything that is not Creative DA). */
export function isSlidesOutputTaskName(taskName: string): boolean {
  return !isCreativeDaTaskName(taskName);
}
