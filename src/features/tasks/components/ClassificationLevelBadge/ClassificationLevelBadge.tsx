import { LevelBadge } from '@/shared/ui/LevelBadge/LevelBadge';
import { CLASSIFICATION_LEVEL_LABELS } from '../../constants';
import type { ClassificationLevel } from '../../schemas/task.schema';

interface ClassificationLevelBadgeProps {
  level: ClassificationLevel;
  className?: string;
}

export function ClassificationLevelBadge({ level, className }: ClassificationLevelBadgeProps) {
  return (
    <LevelBadge level={level} label={CLASSIFICATION_LEVEL_LABELS[level]} className={className} />
  );
}
