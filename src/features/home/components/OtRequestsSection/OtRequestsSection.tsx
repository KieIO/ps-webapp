import { Button, Tag, Tooltip } from 'antd';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { HOME_PLACEHOLDER_COMING_SOON, HOME_PLACEHOLDER_FORMULA_NOTE } from '../../constants';
import styles from './OtRequestsSection.module.scss';

/**
 * TODO(home-ot-requests): Replace placeholder with real pending OT queue + approve/reject
 * once overtime formula / API is provided.
 */
const PLACEHOLDER_ITEMS = [
  {
    id: 'ot-1',
    requester: 'Nguyễn Long',
    project: 'Pokeslide App',
    hours: 4,
    reason: 'Gấp deadline sprint 3',
  },
  {
    id: 'ot-2',
    requester: 'Lê Phương',
    project: 'E-Commerce PWA',
    hours: 6,
    reason: 'Khách hàng yêu cầu sớm',
  },
  {
    id: 'ot-3',
    requester: 'Trần Khánh',
    project: 'CRM Redesign',
    hours: 3,
    reason: 'Bug production nghiêm trọng',
  },
] as const;

export function OtRequestsSection() {
  return (
    <CardWrapper
      title="OT requests chờ duyệt"
      subtitle={HOME_PLACEHOLDER_FORMULA_NOTE}
      actions={<Tag color="gold">{HOME_PLACEHOLDER_COMING_SOON}</Tag>}
      className={styles.card}
    >
      <div className={styles.list} data-todo="home-ot-requests">
        {PLACEHOLDER_ITEMS.map((item) => (
          <article key={item.id} className={styles.item}>
            <div className={styles.itemBody}>
              <div className={styles.itemTitle}>
                <strong>{item.requester}</strong>
                <span className={styles.hours}>+{item.hours}h OT</span>
              </div>
              <p className={styles.project}>{item.project}</p>
              <p className={styles.reason}>{item.reason}</p>
            </div>
            <div className={styles.actions}>
              <Tooltip title={HOME_PLACEHOLDER_COMING_SOON}>
                <Button type="primary" disabled className={styles.approve}>
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title={HOME_PLACEHOLDER_COMING_SOON}>
                <Button danger disabled>
                  Reject
                </Button>
              </Tooltip>
            </div>
          </article>
        ))}
      </div>
    </CardWrapper>
  );
}
