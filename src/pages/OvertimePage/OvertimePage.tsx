import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export default function OvertimePage() {
  return (
    <div>
      <PageHeader title="Overtime" subtitle="OT requests and approvals" />
      <CardWrapper title="Coming soon">
        <p>This module will be implemented in a future phase.</p>
      </CardWrapper>
    </div>
  );
}
