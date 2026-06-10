import { LevelBadge } from '@/shared/ui/LevelBadge/LevelBadge';
import { EVALUATION_LEVEL_LABELS } from '../../constants';
import type { EvaluationLevel } from '../../schemas/project.schema';

interface EvaluationLevelBadgeProps {
  level: EvaluationLevel;
  className?: string;
}

export function EvaluationLevelBadge({ level, className }: EvaluationLevelBadgeProps) {
  return <LevelBadge level={level} label={EVALUATION_LEVEL_LABELS[level]} className={className} />;
}
