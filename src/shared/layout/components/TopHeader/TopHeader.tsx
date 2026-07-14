import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { NotificationBell } from '@/features/notifications/components/NotificationBell/NotificationBell';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { logout } from '@/store/slices/authSlice';
import { clearPermissions } from '@/store/slices/permissionSlice';
import styles from './TopHeader.module.scss';

export function TopHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearPermissions());
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.breadcrumb}>
        <span className={styles.greeting}>Welcome back{user?.name ? `, ${user.name}` : ''}</span>
      </div>

      <div className={styles.actions}>
        <NotificationBell />

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <button type="button" className={styles.userButton}>
            <Avatar size={32} icon={<UserOutlined />} />
            <span className={styles.userName}>{user?.name ?? 'User'}</span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
