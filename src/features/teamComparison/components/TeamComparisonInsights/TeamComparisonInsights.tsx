import { CheckCircle2, CircleAlert, Info } from 'lucide-react';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { TeamComparisonInsight } from '../../utils/buildInsights';
import styles from './TeamComparisonInsights.module.scss';

interface TeamComparisonInsightsProps {
  monthLabel: string;
  insights: TeamComparisonInsight[];
}

function iconForTone(tone: TeamComparisonInsight['tone']) {
  if (tone === 'positive') return <CheckCircle2 size={16} aria-hidden />;
  if (tone === 'warning') return <CircleAlert size={16} aria-hidden />;
  return <Info size={16} aria-hidden />;
}

export function TeamComparisonInsights({ monthLabel, insights }: TeamComparisonInsightsProps) {
  return (
    <CardWrapper
      title={`Insights — Tháng ${monthLabel}`}
      subtitle="Tóm tắt tự động từ dữ liệu ranking tháng này"
      className={styles.card}
    >
      {insights.length === 0 ? (
        <p className={styles.empty}>Chưa đủ dữ liệu để tạo insights cho kỳ này.</p>
      ) : (
        <ul className={styles.list}>
          {insights.map((insight) => (
            <li key={insight.id} className={`${styles.item} ${styles[insight.tone]}`}>
              <span className={styles.icon}>{iconForTone(insight.tone)}</span>
              <p className={styles.text}>{insight.text}</p>
            </li>
          ))}
        </ul>
      )}
    </CardWrapper>
  );
}
