import styles from './DepartmentTag.module.scss';

interface DepartmentTagProps {
  department: string;
}

export function DepartmentTag({ department }: DepartmentTagProps) {
  const isCreative = department === 'Creative';
  return (
    <span className={`${styles.tag} ${isCreative ? styles.creative : styles.project}`}>
      {department}
    </span>
  );
}
