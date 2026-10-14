import { Popover } from 'antd';
import classNames from 'classnames';
import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import { formatMilestoneQuantity, groupMilestonesByDate } from '../../utils/milestoneMarkers';
import { getDayIndex } from '../../utils/calendar';
import type { CalendarDay } from '../../types';
import { getBlockTop } from '../../utils/blockLanes';
import { TRACKER_BLOCK_HEIGHT } from '../../constants';
import styles from '../ProjectTrackerView/ProjectTrackerView.module.scss';

interface MilestoneMarkersProps {
  milestones: readonly ProjectMilestone[];
  days: CalendarDay[];
  dayWidth: number;
  /** Lane of the project span bar (usually 0). */
  projectBarLane: number;
  canManage: boolean;
  onEditMilestone: (milestone: ProjectMilestone) => void;
}

export function MilestoneMarkers({
  milestones,
  days,
  dayWidth,
  projectBarLane,
  canManage,
  onEditMilestone,
}: MilestoneMarkersProps) {
  const groups = groupMilestonesByDate(milestones);

  return (
    <>
      {groups.map((group) => {
        const dayIndex = getDayIndex(days, group.dateKey);
        if (dayIndex < 0) return null;

        const count = group.milestones.length;
        const title = (
          <div className={styles.milestonePopover}>
            {group.milestones.map((milestone) => (
              <div key={milestone.id} className={styles.milestonePopoverItem}>
                <div className={styles.milestonePopoverName}>{milestone.name}</div>
                <div>Khối lượng: {formatMilestoneQuantity(milestone)}</div>
                <div>Hạn nộp: {group.dateKey.split('-').reverse().join('/')}</div>
                {milestone.note ? <div>Ghi chú: {milestone.note}</div> : null}
                {canManage ? (
                  <button
                    type="button"
                    className={styles.milestonePopoverEdit}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditMilestone(milestone);
                    }}
                  >
                    Sửa
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        );

        return (
          <Popover
            key={group.dateKey}
            content={title}
            trigger="hover"
            mouseEnterDelay={0.05}
            placement="top"
            destroyOnHidden
          >
            <button
              type="button"
              className={classNames(styles.milestoneDot, {
                [styles.milestoneDotStacked]: count > 1,
              })}
              style={{
                left: dayIndex * dayWidth + dayWidth / 2,
                top: getBlockTop(projectBarLane) + TRACKER_BLOCK_HEIGHT / 2,
              }}
              aria-label={
                count > 1
                  ? `${count} mốc bàn giao ngày ${group.dateKey}`
                  : `Mốc ${group.milestones[0]?.name ?? ''} ngày ${group.dateKey}`
              }
              onClick={(event) => {
                event.stopPropagation();
                if (canManage && group.milestones[0]) {
                  onEditMilestone(group.milestones[0]);
                }
              }}
            >
              {count > 1 ? <span className={styles.milestoneDotBadge}>{count}</span> : null}
            </button>
          </Popover>
        );
      })}
    </>
  );
}
