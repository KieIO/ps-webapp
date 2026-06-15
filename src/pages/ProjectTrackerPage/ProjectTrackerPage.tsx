import { Alert } from 'antd';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { ProjectTrackerView } from '@/features/tracker/components/ProjectTrackerView/ProjectTrackerView';
import { useTrackerData } from '@/features/tracker/hooks/useTrackerData';
import { GlobalLoadingSpinner } from '@/shared/ui/GlobalLoadingSpinner/GlobalLoadingSpinner';
import styles from './ProjectTrackerPage.module.scss';

export default function ProjectTrackerPage() {
  const { data, isLoading, isError } = useTrackerData();

  if (isLoading && !data) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Project Tracker</h1>
        <div className={styles.bannerWrap}>
          <PendingReactivationBanner />
        </div>
        <GlobalLoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Project Tracker</h1>
      <div className={styles.bannerWrap}>
        <PendingReactivationBanner />
      </div>
      {isError ? (
        <Alert type="error" showIcon message="Unable to load project tracker data" />
      ) : null}
      {data ? (
        <ProjectTrackerView projects={data.projects} offDays={data.offDays} />
      ) : null}
    </div>
  );
}
