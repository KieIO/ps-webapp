import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Access denied"
      subTitle="You do not have permission to view this page"
      extra={
        <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to dashboard
        </Button>
      }
    />
  );
}
