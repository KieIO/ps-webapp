import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { canAccessHomePage } from '@/features/home/utils/homeScope';
import { TeamComparisonDashboard } from '@/features/teamComparison/components/TeamComparisonDashboard/TeamComparisonDashboard';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

/** Head / Creative Head / Admin only — PM, Creative Manager, Employee → 403. */
export default function TeamComparisonPage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (!canAccessHomePage(role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <TeamComparisonDashboard role={role} />;
}
