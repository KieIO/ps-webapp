import { HomeDashboard } from '@/features/home/components/HomeDashboard/HomeDashboard';
import { HomePlaceholder } from '@/features/home/components/HomePlaceholder/HomePlaceholder';
import { isHeadHomeDashboardRole } from '@/features/home/utils/homeScope';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

export default function HomePage() {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role) {
    return null;
  }

  if (isHeadHomeDashboardRole(role)) {
    return <HomeDashboard />;
  }

  return <HomePlaceholder role={role} />;
}
