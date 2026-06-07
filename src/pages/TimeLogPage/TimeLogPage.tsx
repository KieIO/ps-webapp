import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export default function TimeLogPage() {
  return (
    <div>
      <PageHeader title="Time Log" subtitle="Log hours against assigned tasks" />
      <CardWrapper title="Coming soon">
        <p>This module will be implemented in a future phase.</p>
      </CardWrapper>
    </div>
  );
}
