import { computeAverageLevel } from '@/shared/utils/levelScore';
import type { ClassificationLevel } from '../schemas/task.schema';

/** Task level = rounded average of design thinking, technical, and content processing. */
export const computeTaskLevel = (
  designThinking: number,
  technical: number,
  contentProcessing: number,
): ClassificationLevel =>
  computeAverageLevel(designThinking, technical, contentProcessing, 1, 4) as ClassificationLevel;
