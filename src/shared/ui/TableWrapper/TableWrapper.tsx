import type { ReactNode } from 'react';
import { Empty, Spin } from 'antd';
import styles from './TableWrapper.module.scss';

interface TableWrapperProps {
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export function TableWrapper({
  loading,
  isEmpty,
  emptyTitle = 'No data',
  emptyDescription = 'There is nothing to display yet.',
  emptyAction,
  children,
}: TableWrapperProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.empty}>
        <Empty description={emptyTitle}>
          <p className={styles.emptyDescription}>{emptyDescription}</p>
          {emptyAction}
        </Empty>
      </div>
    );
  }

  return <div className={styles.wrapper}>{children}</div>;
}
