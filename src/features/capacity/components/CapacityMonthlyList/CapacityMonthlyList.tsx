import { useState } from 'react';
import { Alert, Skeleton } from 'antd';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { getDefaultCapacityMonthlyFilters } from '../../constants';
import { useCapacityMonthly } from '../../hooks/useCapacityMonthly';
import { formatCapacityPeriodLabel } from '../../utils/capacityMonthlyPeriod';
import { formatPeriodLabel } from '../../utils/formatPeriodLabel';
import { CapacityMonthlyChart } from '../CapacityMonthlyChart/CapacityMonthlyChart';
import { CapacityMonthlyFilters } from '../CapacityMonthlyFilters/CapacityMonthlyFilters';
import { CapacityMonthlySummaryStrip } from '../CapacityMonthlySummaryStrip/CapacityMonthlySummaryStrip';
import { MonthlyDepartmentGrid } from '../MonthlyDepartmentGrid/MonthlyDepartmentGrid';
import styles from './CapacityMonthlyList.module.scss';

const EMPTY_SUMMARY = {
  totalProjects: 0,
  totalSlides: 0,
  workingDays: 0,
  dayCount: 0,
};

export function CapacityMonthlyList() {
  const [filters, setFilters] = useState(getDefaultCapacityMonthlyFilters);
  const { data, isLoading, isError, error } = useCapacityMonthly(filters);

  const periodLabel = data ? formatCapacityPeriodLabel(data, filters) : formatPeriodLabel(filters);

  const errorAlert = isError ? (
    <Alert
      type="error"
      showIcon
      message="Failed to load monthly data"
      description={error instanceof Error ? error.message : 'Please try again.'}
      style={{ marginBottom: 16 }}
    />
  ) : null;

  return (
    <>
      <CapacityMonthlyFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(getDefaultCapacityMonthlyFilters())}
      />

      <CapacityMonthlySummaryStrip
        summary={data?.summary ?? EMPTY_SUMMARY}
        periodLabel={periodLabel}
        loading={isLoading}
      />

      <div className={styles.pageStack}>
        <CardWrapper
          title="Capacity trend"
          subtitle={`Daily utilization by department · ${periodLabel}`}
        >
          {errorAlert}
          {isLoading ? (
            <Skeleton.Node active className={styles.chartSkeleton} />
          ) : (
            <CapacityMonthlyChart days={data?.days ?? []} />
          )}
        </CardWrapper>

        <CardWrapper
          title="Period detail"
          subtitle={`${periodLabel} · table breakdown by day and department`}
        >
          {isLoading ? (
            <div className={styles.loading}>Loading period detail…</div>
          ) : (data?.days.length ?? 0) === 0 ? (
            <div className={styles.empty}>No data for this period.</div>
          ) : (
            <div className={styles.panel}>
              <div className={styles.scrollArea}>
                <div className={styles.scrollContent}>
                  <section className={styles.metricBlock}>
                    <div className={styles.metricHeader}>
                      <h3 className={styles.metricTitle}>Capacity utilization</h3>
                      <p className={styles.metricHint}>Weighted % by department</p>
                    </div>
                    <MonthlyDepartmentGrid days={data?.days ?? []} metric="capacity" />
                  </section>

                  <section className={styles.metricBlock}>
                    <div className={styles.metricHeader}>
                      <h3 className={styles.metricTitle}>Slides delivered</h3>
                      <p className={styles.metricHint}>Total task quantity per day</p>
                    </div>
                    <MonthlyDepartmentGrid
                      days={data?.days ?? []}
                      metric="slides"
                      showDateHeader={false}
                    />
                  </section>
                </div>
              </div>
            </div>
          )}
        </CardWrapper>
      </div>
    </>
  );
}
