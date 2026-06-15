import classNames from 'classnames';
import type { CapacityMonthlyDay, CapacityMonthlyRowKey } from '../../schemas/capacityMonthly.schema';
import { CAPACITY_MONTHLY_ROW_KEYS } from '../../schemas/capacityMonthly.schema';
import { CAPACITY_MONTHLY_ROW_LABELS } from '../../constants';
import { getCapacityDayLabel, spansMultipleMonths } from '../../utils/capacityMonthlyPeriod';
import styles from './MonthlyDepartmentGrid.module.scss';

const CELL_WIDTH = 52;
const LABEL_WIDTH = 148;

export type MonthlyGridMetric = 'capacity' | 'slides';

interface MonthlyDepartmentGridProps {
  days: CapacityMonthlyDay[];
  metric: MonthlyGridMetric;
  showDateHeader?: boolean;
}

function StatusIcon({ hasData }: { hasData: boolean }) {
  if (hasData) return <span className={styles.statusActive} title="Has data">☀️</span>;
  return <span className={styles.statusEmpty} title="No data">🥀</span>;
}

function formatMetricValue(value: number, metric: MonthlyGridMetric) {
  if (metric === 'capacity') return `${value}%`;
  return value.toLocaleString('vi-VN');
}

function MetricCell({
  value,
  isWeekend,
  metric,
}: {
  value: number;
  isWeekend: boolean;
  metric: MonthlyGridMetric;
}) {
  const hasValue = value > 0;

  return (
    <div
      className={classNames(styles.dataCell, {
        [styles.dataCellActiveCapacity]: metric === 'capacity' && hasValue,
        [styles.dataCellActiveSlides]: metric === 'slides' && hasValue,
        [styles.dataCellWeekend]: isWeekend && !hasValue,
      })}
    >
      {formatMetricValue(value, metric)}
    </div>
  );
}

export function MonthlyDepartmentGrid({
  days,
  metric,
  showDateHeader = true,
}: MonthlyDepartmentGridProps) {
  const gridWidth = days.length * CELL_WIDTH;
  const metricModifier = metric === 'capacity' ? styles.gridCapacity : styles.gridSlides;
  const multiMonth = spansMultipleMonths(days);

  const getValue = (day: CapacityMonthlyDay, rowKey: CapacityMonthlyRowKey) =>
    metric === 'capacity' ? (day.capacity[rowKey] ?? 0) : (day.slides[rowKey] ?? 0);

  const hasMetricData = (day: CapacityMonthlyDay) =>
    metric === 'capacity' ? day.hasData : day.hasSlidesData;

  const renderRow = (rowKey: CapacityMonthlyRowKey, label: string, isTotal = false) => (
    <div
      key={`${metric}-${rowKey}`}
      className={classNames(styles.row, { [styles.rowTotal]: isTotal })}
    >
      <div className={styles.labelCell}>{label}</div>
      <div className={styles.dataTrack} style={{ width: gridWidth }}>
        {days.map((day) => (
          <MetricCell
            key={`${metric}-${rowKey}-${day.date}`}
            value={getValue(day, rowKey)}
            isWeekend={day.isWeekend}
            metric={metric}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={classNames(styles.wrapper, metricModifier)}>
      <div className={styles.grid} style={{ minWidth: LABEL_WIDTH + gridWidth }}>
        <div className={styles.row}>
          <div className={classNames(styles.labelCell, styles.labelCellMuted)} />
          <div className={styles.dataTrack} style={{ width: gridWidth }}>
            {days.map((day) => (
              <div
                key={`${metric}-status-${day.date}`}
                className={classNames(styles.statusCell, {
                  [styles.statusCellWeekend]: day.isWeekend,
                })}
              >
                <StatusIcon hasData={hasMetricData(day)} />
              </div>
            ))}
          </div>
        </div>

        {showDateHeader ? (
          <div className={styles.row}>
            <div className={classNames(styles.labelCell, styles.labelCellDate)}>DATE</div>
            <div className={styles.dataTrack} style={{ width: gridWidth }}>
              {days.map((day) => (
                <div
                  key={`${metric}-date-${day.date}`}
                  className={classNames(styles.dateCell, {
                    [styles.dateCellWeekend]: day.isWeekend,
                  })}
                >
                  {getCapacityDayLabel(day, multiMonth)}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {CAPACITY_MONTHLY_ROW_KEYS.map((rowKey) =>
          renderRow(
            rowKey,
            CAPACITY_MONTHLY_ROW_LABELS[rowKey],
            rowKey === 'total',
          ),
        )}
      </div>
    </div>
  );
}
