import dayjs from 'dayjs';
import { Button, Empty, Tooltip } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { DATE_FORMAT, ROUTES, buildMyTaskDetailPath } from '@/config/constants';
import { useRemindMyTask } from '@/features/tasks/hooks/useRemindMyTask';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import {
  MANAGER_ACTION_ISSUE_LABELS,
  MANAGER_ACTION_REMIND_CTA,
  managerActionRemindHint,
  type ManagerActionIssue,
  type ManagerActionTaskItem,
} from '../../utils/managerHomeMetrics';
import homeStyles from '../../styles/homeSection.module.scss';
import styles from './ManagerActionTasksSection.module.scss';

interface ManagerActionTasksSectionProps {
  items: ManagerActionTaskItem[];
}

/** Display order: most urgent first (matches buildManagerActionTasks sort). */
const ISSUE_GROUP_ORDER: ManagerActionIssue[] = ['deadline_risk', 'unconfirmed'];

function groupByIssue(items: ManagerActionTaskItem[]) {
  const buckets = new Map<ManagerActionIssue, ManagerActionTaskItem[]>();
  for (const issue of ISSUE_GROUP_ORDER) {
    buckets.set(issue, []);
  }
  for (const item of items) {
    buckets.get(item.issue)?.push(item);
  }
  return ISSUE_GROUP_ORDER.map((issue) => ({
    issue,
    label: MANAGER_ACTION_ISSUE_LABELS[issue],
    items: buckets.get(issue) ?? [],
  })).filter((group) => group.items.length > 0);
}

function buildSubtitle(items: ManagerActionTaskItem[]): string {
  if (items.length === 0) {
    return 'Chưa cập nhật hoặc sắp quá deadline';
  }
  const deadlineCount = items.filter((item) => item.issue === 'deadline_risk').length;
  const unconfirmedCount = items.filter((item) => item.issue === 'unconfirmed').length;
  const parts = [`${items.length} task`];
  if (deadlineCount > 0) parts.push(`${deadlineCount} sắp quá deadline`);
  if (unconfirmedCount > 0) parts.push(`${unconfirmedCount} chưa cập nhật`);
  return parts.join(' · ');
}

export function ManagerActionTasksSection({ items }: ManagerActionTasksSectionProps) {
  const remind = useRemindMyTask();
  const groups = groupByIssue(items);

  return (
    <CardWrapper
      title="Task cần xử lý"
      subtitle={buildSubtitle(items)}
      actions={
        <Link to={ROUTES.PROJECT_TASKS} className={homeStyles.link}>
          Task list
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty
          description="Không có task cần xử lý trong phạm vi của bạn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className={classNames(styles.groups, homeStyles.scrollBody)}>
          {groups.map((group) => (
            <section key={group.issue} className={styles.group} aria-label={group.label}>
              <header className={homeStyles.groupHeader}>
                <h3 className={homeStyles.groupTitle}>{group.label}</h3>
                <span className={homeStyles.groupCount}>{group.items.length}</span>
              </header>
              <ul className={homeStyles.stack}>
                {group.items.map((item) => {
                  const reminding = remind.isPending && remind.variables?.id === item.id;
                  const cta = MANAGER_ACTION_REMIND_CTA[item.issue];
                  const hint = managerActionRemindHint(item.issue, item.assigneeName);
                  const disabledHint = item.canRemind
                    ? hint
                    : 'Không gửi được: staff chưa liên kết tài khoản';

                  const showConfirmation =
                    item.issue !== 'unconfirmed' || item.staffConfirmationLabel !== item.issueLabel;

                  const remindButton = (
                    <Button
                      size="small"
                      icon={<BellOutlined />}
                      loading={reminding}
                      disabled={!item.canRemind || remind.isPending}
                      onClick={() => remind.mutate({ id: item.id, issue: item.issue })}
                      aria-label={hint}
                    >
                      {cta}
                    </Button>
                  );

                  return (
                    <li
                      key={item.id}
                      className={classNames(
                        homeStyles.item,
                        item.issue === 'deadline_risk' ? homeStyles.toneRisk : homeStyles.toneWarn,
                      )}
                    >
                      <Link to={buildMyTaskDetailPath(item.id)} className={styles.code}>
                        {item.taskCodeShort}
                      </Link>
                      <p className={styles.taskName}>{item.taskName}</p>
                      <div className={homeStyles.meta}>
                        <span>{item.projectName}</span>
                        <span>·</span>
                        <span>{item.assigneeName}</span>
                      </div>
                      <div className={styles.footer}>
                        <div className={styles.footerMeta}>
                          <span className={homeStyles.metaStrong}>
                            Deadline {dayjs(item.deadline).format(DATE_FORMAT)}
                          </span>
                          {showConfirmation && (
                            <span className={styles.confirmation}>
                              Status: {item.staffConfirmationLabel}
                            </span>
                          )}
                        </div>
                        <Tooltip title={disabledHint}>
                          <span className={styles.remindWrap}>{remindButton}</span>
                        </Tooltip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </CardWrapper>
  );
}
