import type { ReactNode } from 'react';
import classNames from 'classnames';
import { StatusPill, type StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import styles from './HomeMetricCard.module.scss';

interface HomeMetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tag?: { label: string; variant: StatusPillVariant };
  footer?: ReactNode;
  placeholder?: boolean;
  className?: string;
}

export function HomeMetricCard({
  label,
  value,
  hint,
  icon,
  tag,
  footer,
  placeholder = false,
  className,
}: HomeMetricCardProps) {
  return (
    <article
      className={classNames(styles.card, placeholder && styles.placeholder, className)}
      data-placeholder={placeholder ? 'true' : undefined}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {tag && <StatusPill label={tag.label} variant={tag.variant} />}
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  );
}
