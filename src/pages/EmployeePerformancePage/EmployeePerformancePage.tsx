import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { EmployeePerformanceDashboard } from '@/features/employeePerformance/components/EmployeePerformanceDashboard/EmployeePerformanceDashboard';

export default function EmployeePerformancePage() {
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return <Navigate to={ROUTES.TEAM_COMPARISON} replace />;
  }

  return <EmployeePerformanceDashboard userId={userId} />;
}
