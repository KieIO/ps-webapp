import { HomeDashboard } from '@/features/home/components/HomeDashboard/HomeDashboard';
import { HomePlaceholder } from '@/features/home/components/HomePlaceholder/HomePlaceholder';
import { ManagerHomeDashboard } from '@/features/home/components/ManagerHomeDashboard/ManagerHomeDashboard';
import { isHeadHomeDashboardRole, isOpsManagerHomeRole } from '@/features/home/utils/homeScope';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

export default function HomePage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (isHeadHomeDashboardRole(role)) {
    return <HomeDashboard />;
  }

  if (isOpsManagerHomeRole(role)) {
    return <ManagerHomeDashboard />;
  }

  return <HomePlaceholder role={role} />;
}
