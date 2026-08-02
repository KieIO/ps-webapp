import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Navigate } from 'react-router-dom';
import { buildUserDetailPath } from '@/config/constants';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { InviteUserModal } from '@/features/users/components/InviteUserModal/InviteUserModal';
import { UsersList } from '@/features/users/components/UsersList/UsersList';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function UsersPage() {
  const { can } = usePermission();
  const actorId = useAppSelector((state) => state.auth.user?.id);
  const canManageUsers = can('MANAGE_USERS');
  const [inviteOpen, setInviteOpen] = useState(false);

  // Employees only see themselves — send them straight to their profile.
  if (!canManageUsers) {
    if (!actorId) return null;
    return <Navigate to={buildUserDetailPath(actorId)} replace />;
  }

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

      <PendingReactivationBanner />
      <UsersList />

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
