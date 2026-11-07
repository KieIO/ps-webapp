/** Leaf module — keep free of task.schema imports to avoid circular init. */
export const CLASSIFICATION_LEVELS = [1, 2, 3, 4, 5] as const;

export type ClassificationLevel = (typeof CLASSIFICATION_LEVELS)[number];
