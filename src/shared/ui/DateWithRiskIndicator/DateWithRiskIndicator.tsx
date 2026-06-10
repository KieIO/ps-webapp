import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import styles from './DateWithRiskIndicator.module.scss';

interface DateWithRiskIndicatorProps {
  date: string;
  atRisk?: boolean;
}

export function DateWithRiskIndicator({ date, atRisk = false }: DateWithRiskIndicatorProps) {
  return (
    <span className={styles.root}>
      {atRisk ? <span className={styles.dot} aria-hidden /> : null}
      {dayjs(date).format(DATE_FORMAT)}
    </span>
  );
}
