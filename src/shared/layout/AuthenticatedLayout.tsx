import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopHeader } from './components/TopHeader/TopHeader';
import styles from './AuthenticatedLayout.module.scss';

export function AuthenticatedLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TopHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
