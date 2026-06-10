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
