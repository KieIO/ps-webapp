import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CapacityList } from '@/features/capacity/components/CapacityList/CapacityList';

export default function CapacityPage() {
  return (
    <div>
      <PageHeader
        title="Capacity"
        subtitle="Workload by employee — utilization and availability"
      />
      <CapacityList />
    </div>
  );
}
