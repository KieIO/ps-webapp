import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export default function WorkloadPage() {
  return (
    <div>
      <PageHeader title="Workload" subtitle="Per-employee capacity heatmap" />
      <CardWrapper title="Coming soon">
        <p>This module will be implemented in a future phase.</p>
      </CardWrapper>
    </div>
  );
}
