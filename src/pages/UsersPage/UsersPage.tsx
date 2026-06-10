import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { InviteUserModal } from '@/features/users/components/InviteUserModal/InviteUserModal';
import { UsersList } from '@/features/users/components/UsersList/UsersList';

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="User list, search, and role management"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setInviteOpen(true)}>
            Invite user
          </Button>
        }
      />

      <UsersList />

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
