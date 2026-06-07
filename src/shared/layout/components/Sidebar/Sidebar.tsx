import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/config/constants';
import { PERMISSIONS } from '@/config/permissions';
import { SIDEBAR_ITEMS } from '@/config/sidebar';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './Sidebar.module.scss';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const role = useAppSelector((state) => state.auth.user?.role);

  const visibleItems = useMemo(
    () =>
      SIDEBAR_ITEMS.filter((item) => {
        if (!item.permission) return true;
        if (!role) return false;
        return (PERMISSIONS[item.permission] as readonly typeof role[]).includes(role);
      }),
    [role],
  );

  const menuItems: MenuProps['items'] = visibleItems.map((item) => ({
    key: item.path,
    icon: <item.icon />,
    label: item.label,
  }));

  const selectedKey =
    visibleItems.find(
      (item) => item.path !== '/' && location.pathname.startsWith(item.path),
    )?.path ??
    (location.pathname === '/' ? '/' : location.pathname);

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      <div className={styles.logo}>
        {!collapsed && <span className={styles.logoText}>{APP_NAME}</span>}
        {collapsed && <span className={styles.logoMark}>P</span>}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        inlineCollapsed={collapsed}
        className={styles.menu}
        onClick={({ key }) => navigate(key)}
      />

      <button
        type="button"
        className={styles.toggle}
        onClick={() => dispatch(toggleSidebar())}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>
    </aside>
  );
}
