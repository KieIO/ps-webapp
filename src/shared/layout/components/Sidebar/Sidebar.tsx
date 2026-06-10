import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/config/constants';
import { SIDEBAR_ITEMS, resolveTaskManagementSelectedPath } from '@/config/sidebar';
import { roleHasPermission } from '@/features/rbac/utils/permissionDerivation';
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
  const permissionConfig = useAppSelector((state) => state.permissionConfig.config);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const visibleItems = useMemo(
    () =>
      SIDEBAR_ITEMS.flatMap((item) => {
        if (item.children) {
          const children = item.children.filter((child) => {
            if (!child.permission) return true;
            if (!role) return false;
            return roleHasPermission(role, child.permission, permissionConfig);
          });
          return children.length > 0 ? [{ ...item, children }] : [];
        }

        if (!item.permission) return [item];
        if (!role) return [];
        return roleHasPermission(role, item.permission, permissionConfig) ? [item] : [];
      }),
    [role, permissionConfig],
  );

  const taskManagementSelectedPath = useMemo(
    () => resolveTaskManagementSelectedPath(location.pathname, location.state),
    [location.pathname, location.state],
  );

  const activeParentKey = useMemo(() => {
    for (const item of visibleItems) {
      if (
        item.children?.some(
          (child) =>
            location.pathname.startsWith(child.path) ||
            child.path === taskManagementSelectedPath,
        )
      ) {
        return item.key;
      }
    }
    return undefined;
  }, [location.pathname, taskManagementSelectedPath, visibleItems]);

  const selectedKey = useMemo(() => {
    if (taskManagementSelectedPath) return taskManagementSelectedPath;

    for (const item of visibleItems) {
      if (item.children) {
        const child = item.children.find((entry) => location.pathname.startsWith(entry.path));
        if (child) return child.path;
      } else if (item.path) {
        if (item.path === '/' && location.pathname === '/') return item.path;
        if (item.path !== '/' && location.pathname.startsWith(item.path)) return item.path;
      }
    }
    return location.pathname === '/' ? '/' : location.pathname;
  }, [location.pathname, visibleItems]);

  useEffect(() => {
    if (activeParentKey) {
      setOpenKeys((current) =>
        current.includes(activeParentKey) ? current : [...current, activeParentKey],
      );
    }
  }, [activeParentKey]);

  const menuItems: MenuProps['items'] = visibleItems.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: <item.icon />,
        label: item.label,
        children: item.children.map((child) => ({
          key: child.path,
          label: child.label,
        })),
      };
    }

    return {
      key: item.path!,
      icon: <item.icon />,
      label: item.label,
    };
  });

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      <div className={styles.logo}>
        {!collapsed && <span className={styles.logoText}>{APP_NAME}</span>}
        {collapsed && <span className={styles.logoMark}>P</span>}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={setOpenKeys}
        items={menuItems}
        inlineCollapsed={collapsed}
        className={styles.menu}
        onClick={({ key }) => {
          if (key.startsWith('/')) {
            navigate(key);
          }
        }}
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
