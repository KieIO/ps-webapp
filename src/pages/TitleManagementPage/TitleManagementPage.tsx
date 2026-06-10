import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { TitleManagementPanel } from '@/features/titles/components/TitleManagementPanel/TitleManagementPanel';

export default function TitleManagementPage() {
  return (
    <div>
      <PageHeader
        title="Title management"
        subtitle="Manage job titles, job levels, and job groups for employees"
      />
      <TitleManagementPanel />
    </div>
  );
}
