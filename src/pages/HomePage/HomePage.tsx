import { Navigate } from 'react-router-dom';
import { HomeDashboard } from '@/features/home/components/HomeDashboard/HomeDashboard';
import { HomePlaceholder } from '@/features/home/components/HomePlaceholder/HomePlaceholder';
import { canAccessHomePage, isHeadHomeDashboardRole } from '@/features/home/utils/homeScope';
import { ROUTES } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

export default function HomePage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (!canAccessHomePage(role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  if (isHeadHomeDashboardRole(role)) {
    return <HomeDashboard />;
  }

  return <HomePlaceholder role={role} />;
}
