import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { TeamComparisonDashboard } from '@/features/teamComparison/components/TeamComparisonDashboard/TeamComparisonDashboard';
import { canAccessTeamComparison } from '@/features/teamComparison/utils/access';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

/** PM / Creative Manager / Head / Creative Head / Admin. */
export default function TeamComparisonPage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (!canAccessTeamComparison(role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <TeamComparisonDashboard role={role} />;
}
