import { Navigate, Outlet } from 'react-router-dom';
import { APP_NAME } from '@/config/constants';
import { ROUTES } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import styles from './UnauthenticatedLayout.module.scss';

export function UnauthenticatedLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className={styles.background}>
      <div className={styles.card}>
        <div className={styles.logo}>P</div>
        <h1 className={styles.title}>{APP_NAME}</h1>
        <Outlet />
      </div>
    </div>
  );
}
