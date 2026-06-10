import type { ReactNode } from 'react';
import { Button } from 'antd';
import styles from './FilterSection.module.scss';

interface FilterSectionProps {
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}

export function FilterSection({ children, onReset, className }: FilterSectionProps) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(' ')}>
      <div className={styles.filters}>{children}</div>
      {onReset && (
        <Button onClick={onReset} className={styles.reset}>
          Reset
        </Button>
      )}
    </div>
  );
}
