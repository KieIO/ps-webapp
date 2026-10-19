import { Popover } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import type { ProjectMilestone } from '@/features/projects/schemas/milestone.schema';
import {
  formatMilestoneNameNote,
  formatMilestoneQuantity,
  groupMilestonesByDate,
  isMilestoneGroupCompleted,
} from '../../utils/milestoneMarkers';
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
  const [openDateKey, setOpenDateKey] = useState<string | null>(null);

  const openEdit = (milestone: ProjectMilestone) => {
    setOpenDateKey(null);
    onEditMilestone(milestone);
  };

  return (
    <>
      {groups.map((group) => {
        const dayIndex = getDayIndex(days, group.dateKey);
        if (dayIndex < 0) return null;

        const count = group.milestones.length;
        const completed = isMilestoneGroupCompleted(group.milestones);
        const content = (
          <div className={styles.milestonePopover}>
            {group.milestones.map((milestone) => {
              const quantityLabel = formatMilestoneQuantity(milestone);
              return (
                <div key={milestone.id} className={styles.milestonePopoverItem}>
                  <div className={styles.milestonePopoverName}>
                    {quantityLabel ? milestone.name : formatMilestoneNameNote(milestone)}
                  </div>
                  {quantityLabel ? <div>Khối lượng: {quantityLabel}</div> : null}
                  <div>Hạn nộp: {group.dateKey.split('-').reverse().join('/')}</div>
                  {quantityLabel && milestone.note ? <div>Ghi chú: {milestone.note}</div> : null}
                  {canManage ? (
                    <button
                      type="button"
                      className={styles.milestonePopoverEdit}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(milestone);
                      }}
                    >
                      Sửa
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        );

        return (
          <Popover
            key={group.dateKey}
            content={content}
            trigger="hover"
            mouseEnterDelay={0.05}
            placement="top"
            destroyOnHidden
            open={openDateKey === group.dateKey}
            onOpenChange={(open) => setOpenDateKey(open ? group.dateKey : null)}
          >
            <button
              type="button"
              className={classNames(styles.milestoneDot, {
                [styles.milestoneDotCompleted]: completed,
                [styles.milestoneDotStacked]: count > 1,
                [styles.milestoneDotInteractive]: canManage,
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
                  openEdit(group.milestones[0]);
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
