import classNames from 'classnames';
import styles from './TaskScoreGroupPill.module.scss';

interface TaskScoreGroupPillProps {
  label: string;
  colorKey: string;
}

export function TaskScoreGroupPill({ label, colorKey }: TaskScoreGroupPillProps) {
  return (
    <span
      className={classNames(styles.pill, styles[colorKey as keyof typeof styles] ?? styles.other)}
    >
      {label}
    </span>
  );
}
