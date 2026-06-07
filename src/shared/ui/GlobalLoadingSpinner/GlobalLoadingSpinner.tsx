import { Spin } from 'antd';
import styles from './GlobalLoadingSpinner.module.scss';

export function GlobalLoadingSpinner() {
  return (
    <div className={styles.container}>
      <Spin size="large" />
    </div>
  );
}
