import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

export default function TaskManagePage() {
  return (
    <div>
      <PageHeader title="Task Management" subtitle="Full task board for managers" />
      <CardWrapper title="Coming soon">
        <p>This module will be implemented in a future phase.</p>
      </CardWrapper>
    </div>
  );
}
