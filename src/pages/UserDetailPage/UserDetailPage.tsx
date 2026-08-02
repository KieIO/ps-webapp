import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { canEditUserProfile } from '@/features/users/utils/userProfileAccess';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { UserDetailForm } from '@/features/users/components/UserDetailForm/UserDetailForm';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, role } = usePermission();
  const actorId = useAppSelector((state) => state.auth.user?.id);
  const canManageUsers = can('MANAGE_USERS');
  const canEdit = id ? canEditUserProfile(role, actorId, id, canManageUsers) : false;

  const handleBack = () => {
    if (canManageUsers) {
      navigate(ROUTES.USERS);
      return;
    }
    navigate(-1);
  };

  return (
    <div>
      <PageHeader
        title="User detail"
        subtitle={canEdit ? 'View and edit user profile' : 'View user profile'}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            {canManageUsers ? 'Back to users' : 'Back'}
          </Button>
        }
      />

      {id ? <UserDetailForm userId={id} /> : null}
    </div>
  );
}
