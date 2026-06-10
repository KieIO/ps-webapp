import { message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TRACKER_CAL_HEADER_HEIGHT,
  TRACKER_DAY_WIDTH,
  TRACKER_DOW_LABELS,
  TRACKER_RANGE_END,
  TRACKER_RANGE_START,
  TRACKER_ROW_HEIGHT,
  TRACKER_TODAY,
  TRACKER_URGENCY_LEGEND,
  TRACKER_URGENCY_STYLES,
} from '../../constants';
import type { TrackerBlock, TrackerOffDay, TrackerProject } from '../../schemas/tracker.schema';
import type { CalendarDay } from '../../types';
import {
  buildCalendarDays,
  buildCalendarMonths,
  formatRangeSubtitle,
  getBlockPosition,
  getCalendarWidth,
  getDayIndex,
  getMonthScrollLeft,
} from '../../utils/calendar';
import { exportTrackerToCsv } from '../../utils/exportTracker';
import styles from './ProjectTrackerView.module.scss';

interface ProjectTrackerViewProps {
  projects: TrackerProject[];
  offDays: TrackerOffDay[];
}

export function ProjectTrackerView({ projects, offDays }: ProjectTrackerViewProps) {
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const mainBodyRef = useRef<HTMLDivElement>(null);
  const [visibleRowCount, setVisibleRowCount] = useState(projects.length);

  const days = useMemo(() => buildCalendarDays(), []);
  const months = useMemo(() => buildCalendarMonths(days), [days]);
  const calendarWidth = useMemo(() => getCalendarWidth(days.length), [days.length]);
  const emptyRowCount = Math.max(0, visibleRowCount - projects.length);
  const canvasHeight = visibleRowCount * TRACKER_ROW_HEIGHT;
  const weekendDays = useMemo(() => days.filter((day) => day.isWeekend), [days]);
  const offDayMarkers = useMemo(
    () =>
      offDays.map((entry) => ({
        ...entry,
        index: getDayIndex(days, entry.date),
      })).filter((entry) => entry.index >= 0),
    [days, offDays],
  );

  const [activeMonthIndex, setActiveMonthIndex] = useState(0);

  useEffect(() => {
    const node = mainBodyRef.current;
    if (!node) return;

    const measureVisibleRows = () => {
      const rowsAreaHeight = node.clientHeight - TRACKER_CAL_HEADER_HEIGHT;
      const count = Math.max(
        projects.length,
        Math.floor(rowsAreaHeight / TRACKER_ROW_HEIGHT),
      );
      setVisibleRowCount(count);
    };

    measureVisibleRows();
    const observer = new ResizeObserver(measureVisibleRows);
    observer.observe(node);

    return () => observer.disconnect();
  }, [projects.length]);

  const activeMonth = months[activeMonthIndex];
  const todayIndex = getDayIndex(days, TRACKER_TODAY);

  const scrollToMonth = useCallback(
    (monthIndex: number) => {
      const month = months[monthIndex];
      if (!month || !calendarScrollRef.current) return;

      setActiveMonthIndex(monthIndex);
      calendarScrollRef.current.scrollLeft = getMonthScrollLeft(days, month.key);
    },
    [days, months],
  );

  const handlePrevMonth = () => {
    if (activeMonthIndex > 0) {
      scrollToMonth(activeMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonthIndex < months.length - 1) {
      scrollToMonth(activeMonthIndex + 1);
    }
  };

  const handleExport = () => {
    exportTrackerToCsv(projects);
    message.success('Export downloaded.');
  };

  const monthNavLabel = activeMonth
    ? `${activeMonth.label} ${activeMonth.year}`
    : dayjs(TRACKER_RANGE_START).format('MMM YYYY').toUpperCase();

  return (
    <div className={styles.root}>
      <div className={styles.board}>
        <div className={styles.controlsBar}>
          <p className={styles.controlsMeta}>
            {projects.length} projects · {formatRangeSubtitle(TRACKER_RANGE_START, TRACKER_RANGE_END)}
          </p>

          <div className={styles.controlsActions}>
            <div className={styles.monthNav}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrevMonth}
                disabled={activeMonthIndex === 0}
                aria-label="Previous month"
              >
                ←
              </button>
              <span className={styles.monthNavLabel}>{monthNavLabel}</span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNextMonth}
                disabled={activeMonthIndex >= months.length - 1}
                aria-label="Next month"
              >
                →
              </button>
            </div>

            <div className={styles.legend}>
              {TRACKER_URGENCY_LEGEND.map((item) => (
                <span key={item.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>

            <button type="button" className={styles.exportBtn} onClick={handleExport}>
              <DownloadOutlined /> Xuất Excel
            </button>
          </div>
        </div>

        <div className={styles.mainBody} ref={mainBodyRef}>
          <div className={styles.leftPanel}>
            <div
              className={styles.leftPanelContent}
              style={{ height: TRACKER_CAL_HEADER_HEIGHT + canvasHeight }}
            >
            <div className={styles.leftHeader}>
              <div className={styles.leftHeaderTop}>
                <div className={styles.leftHeaderName}>Tên Project</div>
                <div className={styles.leftHeaderTeam}>PM &amp; Team</div>
                <div className={styles.leftHeaderSlides}>Slides</div>
              </div>
              <div className={styles.offRowLabel}>Nghỉ hôm nay</div>
            </div>

            <div className={styles.leftRows}>
              {projects.map((project, rowIndex) => {
                const urgencyStyle = TRACKER_URGENCY_STYLES[project.urgency];

                return (
                <div
                  key={project.id}
                  className={styles.projectRow}
                  style={{ borderLeftColor: urgencyStyle.border }}
                >
                  <div className={styles.nameCell}>
                    <span
                      className={styles.urgencyDot}
                      style={{ backgroundColor: urgencyStyle.dot }}
                    />
                    <span className={styles.rowIndex}>{String(rowIndex + 1).padStart(2, '0')}.</span>
                    <span className={styles.projectName}>{project.name}</span>
                  </div>
                  <div className={styles.teamCell}>
                    <div className={styles.pmName}>{project.pm}</div>
                    {project.team.length > 0 && (
                      <div className={styles.teamNames}>{project.team.join(', ')}</div>
                    )}
                  </div>
                  <div
                    className={classNames(styles.slidesCell, {
                      [styles.slidesUrgent]: project.highlightSlides,
                    })}
                  >
                    {project.totalSlides.toLocaleString()}
                  </div>
                </div>
                );
              })}
              {Array.from({ length: emptyRowCount }, (_, index) => (
                <EmptyProjectRow key={`empty-row-${index}`} rowIndex={projects.length + index} />
              ))}
            </div>
            </div>
          </div>

          <div className={styles.calendarPanel} ref={calendarScrollRef}>
            <div className={styles.calendarInner} style={{ width: calendarWidth }}>
              <div className={styles.calendarHeader}>
                <div className={styles.monthRow}>
                  {months.map((month) => (
                    <div
                      key={month.key}
                      className={styles.monthLabel}
                      style={{ width: month.dayCount * TRACKER_DAY_WIDTH }}
                    >
                      {month.label} {month.year}
                    </div>
                  ))}
                </div>

                <div className={styles.dowRow}>
                  {days.map((day) => (
                    <div
                      key={`dow-${day.key}`}
                      className={classNames(styles.dowCell, {
                        [styles.dowWeekend]: day.isWeekend,
                        [styles.dowToday]: day.isToday,
                      })}
                    >
                      {TRACKER_DOW_LABELS[day.dayOfWeek]}
                    </div>
                  ))}
                </div>

                <div className={styles.dateRow}>
                  {days.map((day) => (
                    <div
                      key={`date-${day.key}`}
                      className={classNames(styles.dateCell, {
                        [styles.dateWeekend]: day.isWeekend,
                        [styles.dateToday]: day.isToday,
                      })}
                    >
                      {day.dayOfMonth}
                    </div>
                  ))}
                </div>

                <div className={styles.offRow} style={{ width: calendarWidth }}>
                  {offDayMarkers.map((offDay) => (
                    <div
                      key={offDay.date}
                      className={styles.offDayCell}
                      style={{ left: offDay.index * TRACKER_DAY_WIDTH }}
                    >
                      {offDay.names.map((name) => (
                        <span key={name} className={styles.offName}>
                          {name}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.calendarBody} style={{ height: canvasHeight }}>
                {todayIndex >= 0 && (
                  <div
                    className={styles.todayLine}
                    style={{
                      left: todayIndex * TRACKER_DAY_WIDTH + TRACKER_DAY_WIDTH / 2,
                      height: canvasHeight,
                    }}
                  />
                )}

                {months.slice(1).map((month) => {
                  const left = getMonthScrollLeft(days, month.key);
                  return (
                    <div
                      key={`divider-${month.key}`}
                      className={styles.monthDivider}
                      style={{ left, height: canvasHeight }}
                    />
                  );
                })}

                {projects.map((project, rowIndex) => (
                  <TimelineRow
                    key={project.id}
                    project={project}
                    days={days}
                    weekendDays={weekendDays}
                    todayIndex={todayIndex}
                    rowIndex={rowIndex}
                    top={rowIndex * TRACKER_ROW_HEIGHT}
                  />
                ))}

                {Array.from({ length: emptyRowCount }, (_, index) => {
                  const rowIndex = projects.length + index;
                  return (
                    <EmptyTimelineRow
                      key={`empty-timeline-${index}`}
                      days={days}
                      weekendDays={weekendDays}
                      todayIndex={todayIndex}
                      rowIndex={rowIndex}
                      top={rowIndex * TRACKER_ROW_HEIGHT}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmptyProjectRowProps {
  rowIndex: number;
}

function EmptyProjectRow({ rowIndex }: EmptyProjectRowProps) {
  return (
    <div
      className={classNames(styles.projectRow, styles.projectRowEmpty, {
        [styles.projectRowEven]: rowIndex % 2 === 1,
      })}
      aria-hidden
    >
      <div className={styles.nameCell} />
      <div className={styles.teamCell} />
      <div className={styles.slidesCell} />
    </div>
  );
}

interface EmptyTimelineRowProps {
  days: CalendarDay[];
  weekendDays: CalendarDay[];
  todayIndex: number;
  rowIndex: number;
  top: number;
}

function EmptyTimelineRow({
  days,
  weekendDays,
  todayIndex,
  rowIndex,
  top,
}: EmptyTimelineRowProps) {
  return (
    <div
      className={classNames(
        styles.timelineRow,
        rowIndex % 2 === 0 ? styles.timelineRowOdd : styles.timelineRowEven,
      )}
      style={{ top, width: days.length * TRACKER_DAY_WIDTH, height: TRACKER_ROW_HEIGHT }}
      aria-hidden
    >
      {weekendDays.map((day) => {
        const index = getDayIndex(days, day.date);
        return (
          <div
            key={`we-empty-${rowIndex}-${day.key}`}
            className={styles.weekendShade}
            style={{ left: index * TRACKER_DAY_WIDTH }}
          />
        );
      })}

      {todayIndex >= 0 && (
        <div
          className={styles.todayShade}
          style={{ left: todayIndex * TRACKER_DAY_WIDTH }}
        />
      )}
    </div>
  );
}

interface TimelineRowProps {
  project: TrackerProject;
  days: CalendarDay[];
  weekendDays: CalendarDay[];
  todayIndex: number;
  rowIndex: number;
  top: number;
}

function TimelineRow({
  project,
  days,
  weekendDays,
  todayIndex,
  rowIndex,
  top,
}: TimelineRowProps) {
  return (
    <div
      className={classNames(
        styles.timelineRow,
        rowIndex % 2 === 0 ? styles.timelineRowOdd : styles.timelineRowEven,
      )}
      style={{ top, width: days.length * TRACKER_DAY_WIDTH, height: TRACKER_ROW_HEIGHT }}
    >
      {weekendDays.map((day) => {
        const index = getDayIndex(days, day.date);
        return (
          <div
            key={`we-${project.id}-${day.key}`}
            className={styles.weekendShade}
            style={{ left: index * TRACKER_DAY_WIDTH }}
          />
        );
      })}

      {todayIndex >= 0 && (
        <div
          className={styles.todayShade}
          style={{ left: todayIndex * TRACKER_DAY_WIDTH }}
        />
      )}

      {project.blocks.map((block, index) => (
        <TimelineBlock key={`${project.id}-${index}`} block={block} days={days} />
      ))}
    </div>
  );
}

interface TimelineBlockProps {
  block: TrackerBlock;
  days: CalendarDay[];
}

function TimelineBlock({ block, days }: TimelineBlockProps) {
  const position = getBlockPosition(days, block.start, block.end);
  if (!position) return null;

  const band = block.band ?? 0;

  return (
    <div
      className={classNames(
        styles.block,
        styles[block.type],
        band === 0 ? styles.blockBand0 : styles.blockBand1,
      )}
      style={{ left: position.left, width: Math.max(position.width, 18) }}
      title={block.label}
    >
      <span>{block.label}</span>
    </div>
  );
}
