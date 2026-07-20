import dayjs from 'dayjs';
import { BriefcaseBusiness, CalendarDays } from 'lucide-react';
import type { EmployeePerformanceDetail } from '../../schemas/employeePerformance.schema';
import styles from './EmployeeProfileCard.module.scss';

interface EmployeeProfileCardProps {
  profile: EmployeePerformanceDetail['profile'];
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export function EmployeeProfileCard({ profile }: EmployeeProfileCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.avatar} aria-hidden>
        {initials(profile.name)}
      </div>
      <div className={styles.identity}>
        <h2>{profile.name}</h2>
        <div className={styles.meta}>
          <span>
            <BriefcaseBusiness size={14} aria-hidden />
            {profile.jobTitleName || 'Chưa cập nhật chức danh'}
          </span>
          <span>
            <CalendarDays size={14} aria-hidden />
            Tham gia {dayjs(profile.joinedAt).format('MM/YYYY')}
          </span>
        </div>
      </div>
      <div className={styles.badges}>
        <span className={styles.department}>{profile.displayDepartment}</span>
        {profile.jobLevelLabel ? (
          <span className={styles.level}>{profile.jobLevelLabel}</span>
        ) : null}
      </div>
    </section>
  );
}
