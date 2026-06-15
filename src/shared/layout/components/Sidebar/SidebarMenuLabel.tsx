import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import type { SidebarShortcut } from '@/config/sidebar';
import styles from './Sidebar.module.scss';

interface SidebarMenuLabelProps {
  label: string;
  shortcut?: SidebarShortcut;
}

function SidebarShortcutTooltipContent({ label, shortcut }: Required<SidebarMenuLabelProps>) {
  const [first, second] = shortcut.sequence;

  return (
    <span className={styles.shortcutTooltip}>
      <span>{label}</span>
      <span className={styles.shortcutKeys}>
        <kbd className={styles.shortcutKey}>{first.toUpperCase()}</kbd>
        <span className={styles.shortcutThen}>→</span>
        <kbd className={styles.shortcutKey}>{second.toUpperCase()}</kbd>
      </span>
    </span>
  );
}

export function SidebarMenuLabel({ label, shortcut }: SidebarMenuLabelProps): ReactNode {
  if (!shortcut) return label;

  return (
    <Tooltip
      title={<SidebarShortcutTooltipContent label={label} shortcut={shortcut} />}
      placement="right"
      mouseEnterDelay={0.3}
    >
      <span className={styles.menuLabel}>{label}</span>
    </Tooltip>
  );
}
