import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './PageHeader.module.scss';

export type PageBreadcrumbItem = {
  label: string;
  path?: string;
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: readonly PageBreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <span key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
                  {index > 0 && (
                    <ChevronRight size={12} className={styles.breadcrumbSeparator} aria-hidden />
                  )}
                  {item.path && !isLast ? (
                    <Link to={item.path} className={styles.breadcrumbLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? styles.breadcrumbCurrent : styles.breadcrumbMuted}>
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
