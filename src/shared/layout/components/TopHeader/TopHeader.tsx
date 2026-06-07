import { Avatar, Badge, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { logout } from '@/store/slices/authSlice';
import { clearPermissions } from '@/store/slices/permissionSlice';
import styles from './TopHeader.module.scss';

export function TopHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearPermissions());
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
        <Badge dot>
          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <BellOutlined />
          </button>
        </Badge>

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
