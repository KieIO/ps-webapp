import { useState } from 'react';
import { Alert, message } from 'antd';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { getDefaultCapacityFilters } from '../../constants';
import { useCapacityList } from '../../hooks/useCapacityList';
import { computeAverageCapacityPercent } from '../../utils/averageCapacity';
import {
  formatCapacityListPeriodLabel,
  getCapacityListWorkStatusTitle,
  isCapacityListPeriodView,
} from '../../utils/capacityListPeriod';
import { exportCapacityListToCsv } from '../../utils/exportCapacityList';
import { CapacityFilters } from '../CapacityFilters/CapacityFilters';
import { CapacitySummaryBar } from '../CapacitySummaryBar/CapacitySummaryBar';
import { CapacityTable } from '../CapacityTable/CapacityTable';

export function CapacityList() {
  const [filters, setFilters] = useState(getDefaultCapacityFilters);
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, error } = useCapacityList(filters);
  const periodLabel = formatCapacityListPeriodLabel(filters);
  const isPeriodView = isCapacityListPeriodView(filters);
  const workStatusTitle = getCapacityListWorkStatusTitle(filters, periodLabel);
  const items = data?.items ?? [];
  const averagePercent = data?.averageCapacityPercent ?? computeAverageCapacityPercent(items);

  const handleExport = () => {
    if (items.length === 0) {
      message.warning('Không có dữ liệu capacity để xuất.');
      return;
    }

    setExporting(true);
    try {
      exportCapacityListToCsv(items, filters);
      message.success('Đã tải file xuất.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <CapacityFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(getDefaultCapacityFilters())}
        onExport={handleExport}
        exporting={exporting}
        exportDisabled={isLoading || isError}
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
          items={items}
          loading={isLoading}
          periodLabel={periodLabel}
          isPeriodView={isPeriodView}
          workStatusTitle={workStatusTitle}
        />
      </CardWrapper>
    </>
  );
}
