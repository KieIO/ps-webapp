import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { UserDetailForm } from '@/features/users/components/UserDetailForm/UserDetailForm';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="User detail"
        subtitle="View and edit user profile"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.USERS)}>
            Back to users
          </Button>
        }
      />

      {id ? <UserDetailForm userId={id} /> : null}
    </div>
  );
}
