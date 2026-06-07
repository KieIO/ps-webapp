import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { KPICard } from '@/shared/ui/KPICard/KPICard';
import styles from './DashboardPage.module.scss';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Role-aware summary of KPIs, tasks, and capacity"
      />
      <div className={styles.grid}>
        <KPICard label="Open tasks" value="—" />
        <KPICard label="Due this week" value="—" />
        <KPICard label="Capacity" value="—" />
        <KPICard label="Notifications" value="—" />
      </div>
    </div>
  );
}
