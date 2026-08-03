import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { useClientList } from '../../hooks/useClients';
import type { Client } from '../../schemas/client.schema';
import { ClientFormModal } from '../ClientFormModal/ClientFormModal';
import { ClientTable } from '../ClientTable/ClientTable';

export function ClientList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const { data, isLoading } = useClientList();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      <CardWrapper
        title="Clients"
        subtitle={`${data?.total ?? 0} total`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Create client
          </Button>
        }
      >
        <ClientTable clients={data?.items ?? []} loading={isLoading} onEdit={openEdit} />
      </CardWrapper>

      <ClientFormModal open={modalOpen} client={editing} onClose={closeModal} />
    </>
  );
}
