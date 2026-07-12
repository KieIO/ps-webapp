import { CLASSIFICATION_LEVELS, type ClassificationLevel } from '../schemas/task.schema';

const MIN_CLASSIFICATION_LEVEL = CLASSIFICATION_LEVELS[0];
const MAX_CLASSIFICATION_LEVEL = CLASSIFICATION_LEVELS[CLASSIFICATION_LEVELS.length - 1];

/** Clamp a parsed catalog level into the valid classification range (1–4). */
export function toClassificationLevel(level: number | null): ClassificationLevel | null {
  if (level == null || !Number.isFinite(level)) return null;
  const clamped = Math.min(
    MAX_CLASSIFICATION_LEVEL,
    Math.max(MIN_CLASSIFICATION_LEVEL, Math.trunc(level)),
  );
  return clamped as ClassificationLevel;
}

/** Parse catalog names like `Slides 1` into base task type + level. */
export function parseTaskScoreName(scoreName: string): {
  baseName: string;
  level: number | null;
} {
  const trimmed = scoreName.trim();
  const match = trimmed.match(/^(.*?)\s+(\d+)$/);
  if (!match) {
    return { baseName: trimmed, level: null };
  }

  return {
    baseName: match[1].trim(),
    level: Number(match[2]),
  };
}
