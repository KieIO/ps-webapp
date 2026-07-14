import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/config/constants';
import {
  SIDEBAR_ITEMS,
  collectSidebarShortcutTargets,
  resolveSidebarChildPath,
  resolveTaskManagementSelectedPath,
} from '@/config/sidebar';
import { roleHasPermission } from '@/features/rbac/utils/permissionDerivation';
import { canViewProjectTracker } from '@/features/rbac/utils/canViewProjectTracker';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useSidebarShortcuts } from '@/shared/hooks/useSidebarShortcuts';
import { formatShortcutLabel } from '@/shared/utils/keyboardShortcut';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { SidebarMenuLabel } from './SidebarMenuLabel';
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

        if (item.key === 'project-tracker') {
          return canViewProjectTracker(role, permissionConfig) ? [item] : [];
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
      if (!item.children) continue;
      const matchedChild = resolveSidebarChildPath(location.pathname, item.children);
      const matchesTaskDetail = item.children.some(
        (child) => child.path === taskManagementSelectedPath,
      );
      if (matchedChild || matchesTaskDetail) {
        return item.key;
      }
    }
    return undefined;
  }, [location.pathname, taskManagementSelectedPath, visibleItems]);

  const selectedKey = useMemo(() => {
    if (taskManagementSelectedPath) return taskManagementSelectedPath;

    for (const item of visibleItems) {
      if (item.children) {
        const childPath = resolveSidebarChildPath(location.pathname, item.children);
        if (childPath) return childPath;
      } else if (item.path) {
        if (item.path === '/' && location.pathname === '/') return item.path;
        if (item.path !== '/' && location.pathname.startsWith(item.path)) return item.path;
      }
    }
    return location.pathname === '/' ? '/' : location.pathname;
  }, [location.pathname, taskManagementSelectedPath, visibleItems]);

  useEffect(() => {
    if (activeParentKey) {
      setOpenKeys((current) =>
        current.includes(activeParentKey) ? current : [...current, activeParentKey],
      );
    }
  }, [activeParentKey]);

  const shortcutTargets = useMemo(
    () => collectSidebarShortcutTargets(visibleItems),
    [visibleItems],
  );

  useSidebarShortcuts(shortcutTargets);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      visibleItems.map((item) => {
        if (item.children) {
          return {
            key: item.key,
            icon: <item.icon />,
            label: item.label,
            title: item.label,
            children: item.children.map((child) => ({
              key: child.path,
              label: <SidebarMenuLabel label={child.label} shortcut={child.shortcut} />,
              title: collapsed
                ? child.shortcut
                  ? `${child.label} (${formatShortcutLabel(child.shortcut)})`
                  : child.label
                : undefined,
            })),
          };
        }

        return {
          key: item.path!,
          icon: <item.icon />,
          label: <SidebarMenuLabel label={item.label} shortcut={item.shortcut} />,
          title: collapsed
            ? item.shortcut
              ? `${item.label} (${formatShortcutLabel(item.shortcut)})`
              : item.label
            : undefined,
        };
      }),
    [collapsed, visibleItems],
  );

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
