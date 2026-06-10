import { computeAverageLevel } from '@/shared/utils/levelScore';
import type { EvaluationLevel } from '../schemas/project.schema';

/** Project level = rounded average of volume, nature, and time (business rule). */
export const computeProjectLevel = (
  volume: number,
  nature: number,
  time: number,
): EvaluationLevel =>
  computeAverageLevel(volume, nature, time, 1, 4) as EvaluationLevel;
