import type { ReactNode } from 'react';
import styles from './CardWrapper.module.scss';

interface CardWrapperProps {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CardWrapper({ title, subtitle, actions, children, className }: CardWrapperProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <div className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
