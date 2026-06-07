import type { ReactNode } from 'react';
import styles from './FormFieldWrapper.module.scss';

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

export function FormFieldWrapper({
  label,
  required,
  helperText,
  error,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        helperText && <p className={styles.helper}>{helperText}</p>
      )}
    </div>
  );
}
