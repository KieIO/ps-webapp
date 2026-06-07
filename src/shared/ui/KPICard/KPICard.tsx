import type { ReactNode } from 'react';
import styles from './KPICard.module.scss';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
}

export function KPICard({ label, value, trend, icon }: KPICardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {trend && <div className={styles.trend}>{trend}</div>}
    </div>
  );
}
