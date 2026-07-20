import { ProductivityDashboard } from '@/features/productivity/components/ProductivityDashboard/ProductivityDashboard';
import { TeamProductivityDashboard } from '@/features/productivity/components/TeamProductivityDashboard/TeamProductivityDashboard';
import { isHeadHomeDashboardRole, isOpsManagerHomeRole } from '@/features/home/utils/homeScope';
import { ROLES } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';

export default function ProductivityPage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (isHeadHomeDashboardRole(role) || role === ROLES.ADMIN) {
    return <ProductivityDashboard />;
  }

  if (isOpsManagerHomeRole(role)) {
    return <TeamProductivityDashboard role={role} />;
  }

  return <Navigate to={ROUTES.FORBIDDEN} replace />;
}
