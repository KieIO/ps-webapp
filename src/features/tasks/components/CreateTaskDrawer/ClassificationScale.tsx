import classNames from 'classnames';
import { CLASSIFICATION_LEVELS } from '../../schemas/task.schema';
import styles from './CreateTaskDrawer.module.scss';

interface ClassificationScaleProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function ClassificationScale({ value, onChange, disabled }: ClassificationScaleProps) {
  return (
    <div className={styles.scale} role="radiogroup">
      {CLASSIFICATION_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={value === level}
          disabled={disabled}
          className={classNames(styles.scaleBtn, value === level && styles.scaleBtnActive)}
          onClick={() => onChange?.(level)}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
