import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { ClientList } from '@/features/clients/components/ClientList/ClientList';

export default function ClientManagementPage() {
  return (
    <div>
      <PageHeader title="Client management" subtitle="Manage clients used on projects" />
      <ClientList />
    </div>
  );
}
