import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DATE_FORMAT } from '@/config/constants';
import styles from './DateWithRiskIndicator.module.scss';

dayjs.extend(utc);

interface DateWithRiskIndicatorProps {
  date: string;
  atRisk?: boolean;
  /** Display format; defaults to date-only. Use DATETIME_SHORT_FORMAT for deadlines with time. */
  format?: string;
}

export function DateWithRiskIndicator({
  date,
  atRisk = false,
  format = DATE_FORMAT,
}: DateWithRiskIndicatorProps) {
  return (
    <span className={styles.root}>
      {atRisk ? <span className={styles.dot} aria-hidden /> : null}
      {dayjs.utc(date).format(format)}
    </span>
  );
}
