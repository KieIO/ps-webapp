import { useState } from 'react';
import { Alert } from 'antd';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { getDefaultCapacityFilters } from '../../constants';
import { useCapacityList } from '../../hooks/useCapacityList';
import { computeAverageCapacityPercent } from '../../utils/averageCapacity';
import {
  formatCapacityListPeriodLabel,
  getCapacityListWorkStatusTitle,
  isCapacityListPeriodView,
} from '../../utils/capacityListPeriod';
import { CapacityFilters } from '../CapacityFilters/CapacityFilters';
import { CapacitySummaryBar } from '../CapacitySummaryBar/CapacitySummaryBar';
import { CapacityTable } from '../CapacityTable/CapacityTable';

export function CapacityList() {
  const [filters, setFilters] = useState(getDefaultCapacityFilters);
  const { data, isLoading, isError, error } = useCapacityList(filters);
  const periodLabel = formatCapacityListPeriodLabel(filters);
  const isPeriodView = isCapacityListPeriodView(filters);
  const workStatusTitle = getCapacityListWorkStatusTitle(filters, periodLabel);
  const averagePercent =
    data?.averageCapacityPercent ?? computeAverageCapacityPercent(data?.items ?? []);

  return (
    <>
      <CapacityFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(getDefaultCapacityFilters())}
      />

      <CardWrapper
        title="Team capacity"
        subtitle={`${data?.total ?? 0} employees · ${periodLabel}`}
      >
        {isError ? (
          <Alert
            type="error"
            showIcon
            message="Failed to load capacity data"
            description={error instanceof Error ? error.message : 'Please try again.'}
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <CapacitySummaryBar
          averagePercent={averagePercent}
          periodLabel={periodLabel}
          isPeriodView={isPeriodView}
        />
        <CapacityTable
          items={data?.items ?? []}
          loading={isLoading}
          periodLabel={periodLabel}
          isPeriodView={isPeriodView}
          workStatusTitle={workStatusTitle}
        />
      </CardWrapper>
    </>
  );
}
