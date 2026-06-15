import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CapacityMonthlyList } from '@/features/capacity/components/CapacityMonthlyList/CapacityMonthlyList';

export default function CapacityMonthlyPage() {
  return (
    <div>
      <PageHeader
        title="Capacity by month"
        subtitle="Trend chart and daily breakdown by department — switch month to compare"
      />
      <CapacityMonthlyList />
    </div>
  );
}
