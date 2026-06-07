import type { ReactNode } from 'react';
import { Button } from 'antd';
import styles from './FilterSection.module.scss';

interface FilterSectionProps {
  children: ReactNode;
  onReset?: () => void;
}

export function FilterSection({ children, onReset }: FilterSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.filters}>{children}</div>
      {onReset && (
        <Button onClick={onReset} className={styles.reset}>
          Reset
        </Button>
      )}
    </div>
  );
}
