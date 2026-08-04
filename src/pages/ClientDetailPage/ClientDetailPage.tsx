import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ClientDetailView } from '@/features/clients/components/ClientDetailView/ClientDetailView';
import { useClient } from '@/features/clients/hooks/useClients';
import { usePermission } from '@/shared/hooks/usePermission';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermission();
  const { data: client } = useClient(id ?? '');

  const handleBack = () => {
    if (can('MANAGE_CLIENTS')) {
      navigate(ROUTES.CLIENT_MANAGEMENT);
      return;
    }
    navigate(ROUTES.PROJECTS);
  };

  return (
    <div>
      <PageHeader
        title={client ? client.name : 'Client'}
        subtitle="Client knowledge shared across projects"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            {can('MANAGE_CLIENTS') ? 'Back to clients' : 'Back to projects'}
          </Button>
        }
      />

      {id ? <ClientDetailView clientId={id} /> : null}
    </div>
  );
}
