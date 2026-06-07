import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Productivity reports and export" />
      <CardWrapper title="Coming soon">
        <p>This module will be implemented in a future phase.</p>
      </CardWrapper>
    </div>
  );
}
