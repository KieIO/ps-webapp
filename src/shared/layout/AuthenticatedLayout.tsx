import classNames from 'classnames';
import { Suspense } from 'react';
import { Navigate, Outlet, useMatches } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { NotificationStreamProvider } from '@/features/notifications/components/NotificationStreamProvider/NotificationStreamProvider';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopHeader } from './components/TopHeader/TopHeader';
import styles from './AuthenticatedLayout.module.scss';

interface RouteHandle {
  contentLayout?: 'flush';
}

export function AuthenticatedLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const matches = useMatches();
  const isFlushContent = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.contentLayout === 'flush',
  );

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <NotificationStreamProvider>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.main}>
          <TopHeader />
          <main className={classNames(styles.content, isFlushContent && styles.contentFlush)}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </NotificationStreamProvider>
  );
}
