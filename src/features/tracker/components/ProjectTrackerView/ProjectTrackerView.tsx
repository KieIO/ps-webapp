import { DatePicker, message, Popover, Tooltip } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import {
  buildProjectDetailPath,
  buildProjectTasksPath,
  buildUserDetailPath,
} from '@/config/constants';
import { useRemainingOutput } from '@/features/capacity/hooks/useRemainingOutput';
import type { RemainingOutputDay } from '@/features/capacity/schemas/remainingOutput.schema';
import { PROJECT_NAME_COLUMN_LABEL } from '@/features/projects/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { ProjectNameLink } from '@/shared/ui/ProjectNameLink/ProjectNameLink';
import {
  TRACKER_ADMIN_DAY_ZOOM_DEFAULT,
  TRACKER_ADMIN_DAY_ZOOM_OPTIONS,
  TRACKER_ADMIN_DAY_ZOOM_WIDTH,
  TRACKER_BLOCK_HEIGHT,
  TRACKER_DOW_LABELS,
  TRACKER_INITIAL_LOOKBACK_DAYS,
  TRACKER_RANGE_END,
  TRACKER_RANGE_START,
  TRACKER_ROW_HEIGHT,
  TRACKER_TODAY,
  TRACKER_BLOCK_LEGEND,
  TRACKER_PROJECT_STATUS_LEGEND,
  TRACKER_URGENCY_LEGEND,
  TRACKER_URGENCY_STYLES,
  getTrackerCalHeaderHeight,
  type TrackerAdminDayZoom,
} from '../../constants';
import type { TrackerOffDay, TrackerProject } from '../../schemas/tracker.schema';
import type { CalendarDay } from '../../types';
import {
  inferOutputMetricFromTaskName,
  parseTrackerTaskBaseLabel,
} from '../../utils/aggregateAdminBlocks';
import { getBlockTop, layoutProjectBlocks, type LaidOutBlock } from '../../utils/blockLanes';
import { mergeProjectRowLayout } from '../../utils/rowContentHeight';
import {
  buildCalendarDays,
  buildCalendarMonths,
  formatRangeSubtitle,
  getAdminZoomDayWidth,
  getBlockPosition,
  getCalendarWidth,
  getDayIndex,
  getInitialScrollLeft,
  getMonthScrollLeft,
} from '../../utils/calendar';
import { exportTrackerToCsv } from '../../utils/exportTracker';
import {
  isProjectTimelineBar,
  withMonthScopedTrackerMetrics,
} from '../../utils/monthScopedTracker';
import { TrackerUrgencyDot } from '../TrackerUrgencyDot/TrackerUrgencyDot';
import styles from './ProjectTrackerView.module.scss';

interface ProjectTrackerViewProps {
  projects: TrackerProject[];
  offDays: TrackerOffDay[];
}

function TrackerLegendContent() {
  return (
    <div className={styles.legendPopover}>
      <div className={styles.legendPopoverGroup}>
        <p className={styles.legendPopoverTitle}>Độ ưu tiên</p>
        <ul className={styles.legendPopoverList}>
          {TRACKER_URGENCY_LEGEND.map((item) => (
            <li key={item.label} className={styles.legendPopoverItem}>
              <span className={classNames(styles.legendDot, styles[`legendDot_${item.key}`])} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.legendPopoverGroup}>
        <p className={styles.legendPopoverTitle}>Trạng thái project</p>
        <ul className={styles.legendPopoverList}>
          {TRACKER_PROJECT_STATUS_LEGEND.map((item) => (
            <li key={`project-${item.key}`} className={styles.legendPopoverItem}>
              <span className={classNames(styles.legendBar, styles[`legendBar_${item.key}`])} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.legendPopoverGroup}>
        <p className={styles.legendPopoverTitle}>Trạng thái task</p>
        <ul className={styles.legendPopoverList}>
          {TRACKER_BLOCK_LEGEND.map((item) => (
            <li key={`task-${item.key}`} className={styles.legendPopoverItem}>
              <span className={classNames(styles.legendBar, styles[`legendBar_${item.key}`])} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ProjectTrackerView({ projects, offDays }: ProjectTrackerViewProps) {
  const { can } = usePermission();
  const canViewRemainingOutput = can('VIEW_CAPACITY_FULL');
  const calHeaderHeight = getTrackerCalHeaderHeight(canViewRemainingOutput);
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const mainBodyRef = useRef<HTMLDivElement>(null);
  const prevMonthKeyRef = useRef('');
  const prevDayWidthRef = useRef(0);
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs(TRACKER_TODAY).startOf('month'));
  const [dayZoom, setDayZoom] = useState<TrackerAdminDayZoom>(TRACKER_ADMIN_DAY_ZOOM_DEFAULT);
  const [panelWidth, setPanelWidth] = useState(0);
  const [rowLayout, setRowLayout] = useState(() => ({
    visibleRowCount: projects.length,
    canvasHeight: projects.length * TRACKER_ROW_HEIGHT,
  }));

  const days = useMemo(
    () =>
      buildCalendarDays(
        selectedMonth.startOf('month').format('YYYY-MM-DD'),
        selectedMonth.endOf('month').format('YYYY-MM-DD'),
      ),
    [selectedMonth],
  );
  const monthStart = useMemo(
    () => selectedMonth.startOf('month').format('YYYY-MM-DD'),
    [selectedMonth],
  );
  const monthEnd = useMemo(
    () => selectedMonth.endOf('month').format('YYYY-MM-DD'),
    [selectedMonth],
  );
  const monthScopedProjects = useMemo(
    () => projects.map((project) => withMonthScopedTrackerMetrics(project, monthStart, monthEnd)),
    [projects, monthStart, monthEnd],
  );
  const months = useMemo(() => buildCalendarMonths(days), [days]);
  const dayWidth = useMemo(
    () => getAdminZoomDayWidth(days.length, panelWidth, TRACKER_ADMIN_DAY_ZOOM_WIDTH[dayZoom]),
    [dayZoom, days.length, panelWidth],
  );
  const calendarWidth = useMemo(
    () => getCalendarWidth(days.length, dayWidth),
    [days.length, dayWidth],
  );
  const projectLayouts = useMemo(
    () =>
      monthScopedProjects.map((project) =>
        mergeProjectRowLayout(layoutProjectBlocks(project.blocks, project.name), project),
      ),
    [monthScopedProjects],
  );
  const totalProjectsHeight = useMemo(
    () => projectLayouts.reduce((sum, layout) => sum + layout.rowHeight, 0),
    [projectLayouts],
  );
  const rowOffsets = useMemo(() => {
    const offsets: number[] = [];
    let cumulative = 0;
    for (const layout of projectLayouts) {
      offsets.push(cumulative);
      cumulative += layout.rowHeight;
    }
    return offsets;
  }, [projectLayouts]);
  const emptyRowCount = Math.max(0, rowLayout.visibleRowCount - monthScopedProjects.length);
  const canvasHeight = rowLayout.canvasHeight;
  const weekendDays = useMemo(() => days.filter((day) => day.isWeekend), [days]);
  const offDayMarkers = useMemo(
    () =>
      offDays
        .map((entry) => ({
          ...entry,
          index: getDayIndex(days, entry.date),
        }))
        .filter((entry) => entry.index >= 0),
    [days, offDays],
  );
  const selectedMonthStart = selectedMonth.startOf('month');
  const selectedMonthEnd = selectedMonth.endOf('month');
  const trackerRangeStart = dayjs(TRACKER_RANGE_START).startOf('day');
  const trackerRangeEnd = dayjs(TRACKER_RANGE_END).startOf('day');
  const isOutOfDataRange =
    selectedMonthEnd.isBefore(trackerRangeStart, 'day') ||
    selectedMonthStart.isAfter(trackerRangeEnd, 'day');

  const { data: remainingOutput } = useRemainingOutput(
    { startDate: monthStart, endDate: monthEnd },
    { enabled: canViewRemainingOutput && !isOutOfDataRange },
  );
  const remainingByDate = useMemo(() => {
    const map = new Map<string, RemainingOutputDay>();
    for (const day of remainingOutput?.days ?? []) {
      map.set(day.date, day);
    }
    return map;
  }, [remainingOutput?.days]);
  const remainingAssumptionNote =
    remainingOutput?.assumption.note ??
    'Dòng Còn lại / ngày ước lượng khối lượng còn làm được trong ngày theo Điểm task CM của nhân viên đang active (không dùng Capacity/ngày đầy đủ). Phòng Project: điểm còn lại ÷ 45 = slides (Slides level 3). Phòng Creative: điểm còn lại ÷ 480 = DA (DA level 2).';

  useEffect(() => {
    const calendarNode = calendarScrollRef.current;
    if (!calendarNode) return;

    const measurePanelWidth = () => {
      setPanelWidth(calendarNode.clientWidth);
    };

    measurePanelWidth();
    const observer = new ResizeObserver(measurePanelWidth);
    observer.observe(calendarNode);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const calendarNode = calendarScrollRef.current;
    if (!calendarNode || dayWidth <= 0) return;

    const monthKey = selectedMonth.format('YYYY-MM');
    const monthChanged = prevMonthKeyRef.current !== monthKey;
    const prevDayWidth = prevDayWidthRef.current;

    prevMonthKeyRef.current = monthKey;
    prevDayWidthRef.current = dayWidth;

    if (monthChanged) {
      if (selectedMonth.isSame(dayjs(TRACKER_TODAY), 'month')) {
        calendarNode.scrollLeft = getInitialScrollLeft(
          days,
          TRACKER_TODAY,
          TRACKER_INITIAL_LOOKBACK_DAYS,
          dayWidth,
        );
      } else {
        calendarNode.scrollLeft = 0;
      }
      return;
    }

    // Keep the same day anchored when fitted day width changes (resize), instead of
    // resetting to the initial lookback offset.
    if (prevDayWidth > 0 && prevDayWidth !== dayWidth) {
      calendarNode.scrollLeft = (calendarNode.scrollLeft / prevDayWidth) * dayWidth;
    }
  }, [days, dayWidth, selectedMonth]);

  useEffect(() => {
    const node = mainBodyRef.current;
    if (!node) return;

    const measureVisibleRows = () => {
      const rowsAreaHeight = Math.max(0, node.clientHeight - calHeaderHeight);
      const minCanvasHeight = totalProjectsHeight;
      // Floor (not ceil) so filler rows never overshoot the measured area and
      // push flex ancestors taller (empty-row feedback loop on Tracker).
      const fillRowCount = Math.floor(
        Math.max(0, rowsAreaHeight - minCanvasHeight) / TRACKER_ROW_HEIGHT,
      );
      const visibleRowCount = monthScopedProjects.length + fillRowCount;
      const nextCanvasHeight = minCanvasHeight + fillRowCount * TRACKER_ROW_HEIGHT;

      setRowLayout((previous) => {
        if (
          previous.visibleRowCount === visibleRowCount &&
          previous.canvasHeight === nextCanvasHeight
        ) {
          return previous;
        }
        return {
          visibleRowCount,
          canvasHeight: nextCanvasHeight,
        };
      });
    };

    measureVisibleRows();
    const observer = new ResizeObserver(measureVisibleRows);
    observer.observe(node);

    return () => observer.disconnect();
  }, [calHeaderHeight, monthScopedProjects.length, totalProjectsHeight]);

  const todayIndex = getDayIndex(days, TRACKER_TODAY);

  const handlePrevMonth = () => {
    setSelectedMonth((current) => current.subtract(1, 'month').startOf('month'));
  };

  const handleNextMonth = () => {
    setSelectedMonth((current) => current.add(1, 'month').startOf('month'));
  };

  const handleMonthChange = (nextMonth: Dayjs | null) => {
    if (!nextMonth) return;
    setSelectedMonth(nextMonth.startOf('month'));
  };

  const handleExport = () => {
    exportTrackerToCsv(monthScopedProjects, selectedMonth.format('YYYY-MM'));
    message.success('Export downloaded.');
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.rootAdminZoom]: dayZoom !== 'fit',
      })}
    >
      <div className={styles.board}>
        <div className={styles.controlsBar}>
          <p className={styles.controlsMeta}>
            {projects.length} projects ·{' '}
            {formatRangeSubtitle(TRACKER_RANGE_START, TRACKER_RANGE_END)}
          </p>

          <div className={styles.controlsActions}>
            <div className={styles.monthNavWrap}>
              <div
                className={classNames(styles.monthNav, {
                  [styles.monthNavOutOfRange]: isOutOfDataRange,
                })}
              >
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                >
                  ←
                </button>
                <DatePicker
                  picker="month"
                  allowClear={false}
                  inputReadOnly
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  format={(value) => value.format('MMM YYYY').toUpperCase()}
                  className={styles.monthNavPicker}
                  aria-label="Pick month and year"
                  suffixIcon={null}
                />
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={handleNextMonth}
                  aria-label="Next month"
                >
                  →
                </button>
              </div>
              {isOutOfDataRange ? (
                <span className={styles.monthNavHint}>
                  Khong co du lieu tracker cho thang/nam da chon
                </span>
              ) : null}
            </div>

            <div className={styles.zoomGroup} role="group" aria-label="Zoom độ rộng ngày">
              <span className={styles.zoomLabel}>Zoom</span>
              <div className={styles.zoomToggle}>
                {TRACKER_ADMIN_DAY_ZOOM_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={classNames(styles.zoomBtn, {
                      [styles.zoomBtnActive]: dayZoom === option.value,
                    })}
                    aria-pressed={dayZoom === option.value}
                    onClick={() => setDayZoom(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Popover
              trigger="click"
              placement="bottomRight"
              arrow={false}
              content={<TrackerLegendContent />}
            >
              <button type="button" className={styles.legendBtn} aria-label="Chú thích màu">
                <InfoCircleOutlined /> Chú thích
              </button>
            </Popover>

            <button type="button" className={styles.exportBtn} onClick={handleExport}>
              <DownloadOutlined /> Xuất Excel
            </button>
          </div>
        </div>

        <div className={styles.mainBody} ref={mainBodyRef}>
          <div className={styles.leftPanel}>
            <div
              className={styles.leftPanelContent}
              style={{ height: calHeaderHeight + canvasHeight }}
            >
              <div
                className={styles.leftHeader}
                style={{ height: calHeaderHeight, minHeight: calHeaderHeight }}
              >
                <div className={styles.leftHeaderTop}>
                  <div className={styles.leftHeaderName}>{PROJECT_NAME_COLUMN_LABEL}</div>
                  <div className={styles.leftHeaderTeam}>PM/CM</div>
                  <div className={styles.leftHeaderSlides}>Total / tháng</div>
                </div>
                <div
                  className={classNames(styles.offRowLabel, {
                    [styles.offRowLast]: !canViewRemainingOutput,
                  })}
                >
                  Nghỉ phép
                </div>
                {canViewRemainingOutput ? (
                  <Tooltip title={remainingAssumptionNote} placement="right">
                    <div className={styles.capacityRowLabel}>Còn lại / ngày</div>
                  </Tooltip>
                ) : null}
              </div>

              <div className={styles.leftRows}>
                {monthScopedProjects.map((project, rowIndex) => {
                  const urgencyStyle = TRACKER_URGENCY_STYLES[project.urgency];
                  const rowHeight = projectLayouts[rowIndex]?.rowHeight ?? TRACKER_ROW_HEIGHT;

                  return (
                    <div
                      key={project.id}
                      className={styles.projectRow}
                      style={{
                        borderLeftColor: urgencyStyle.border,
                        height: rowHeight,
                        minHeight: rowHeight,
                      }}
                    >
                      <div className={styles.nameCell}>
                        <TrackerUrgencyDot project={project} />
                        <span className={styles.rowIndex}>
                          {String(rowIndex + 1).padStart(2, '0')}.
                        </span>
                        <ProjectNameLink
                          name={project.name}
                          projectId={project.id}
                          className={styles.projectNameLink}
                        />
                      </div>
                      <div className={styles.teamCell}>
                        <div className={styles.pmName}>{project.pm}</div>
                        {(project.cm ?? []).map((name) => (
                          <div key={name} className={styles.cmName}>
                            {name}
                          </div>
                        ))}
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
                  <EmptyProjectRow
                    key={`empty-row-${index}`}
                    rowIndex={monthScopedProjects.length + index}
                  />
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
                      style={{ width: month.dayCount * dayWidth }}
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
                      style={{ width: dayWidth }}
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
                      style={{ width: dayWidth }}
                    >
                      {day.dayOfMonth}
                    </div>
                  ))}
                </div>

                <div
                  className={classNames(styles.offRow, {
                    [styles.offRowLast]: !canViewRemainingOutput,
                  })}
                  style={{ width: calendarWidth }}
                >
                  {offDayMarkers.map((offDay) => {
                    const people =
                      offDay.people.length > 0
                        ? offDay.people
                        : offDay.names.map((name) => ({ id: '', name }));
                    return (
                      <div
                        key={offDay.date}
                        className={styles.offDayCell}
                        style={{ left: offDay.index * dayWidth, width: dayWidth }}
                      >
                        {people.map((person) =>
                          person.id ? (
                            <Link
                              key={person.id}
                              to={buildUserDetailPath(person.id)}
                              className={styles.offNameLink}
                              title={`Open ${person.name}`}
                            >
                              {person.name}
                            </Link>
                          ) : (
                            <span key={person.name} className={styles.offName}>
                              {person.name}
                            </span>
                          ),
                        )}
                      </div>
                    );
                  })}
                </div>

                {canViewRemainingOutput ? (
                  <div className={styles.capacityRow} style={{ width: calendarWidth }}>
                    {days.map((day) => {
                      const remaining = remainingByDate.get(day.date);
                      return (
                        <div
                          key={`capacity-${day.key}`}
                          className={classNames(styles.capacityDayCell, {
                            [styles.capacityDayWeekend]: day.isWeekend,
                          })}
                          style={{ width: dayWidth }}
                          title={remainingAssumptionNote}
                        >
                          {remaining ? (
                            <>
                              <span
                                className={classNames(styles.capacitySlides, {
                                  [styles.capacityNegative]: remaining.projectRemainingSlides < 0,
                                })}
                              >
                                {remaining.projectRemainingSlides} S
                              </span>
                              <span
                                className={classNames(styles.capacityDa, {
                                  [styles.capacityNegative]: remaining.creativeRemainingDA < 0,
                                })}
                              >
                                {remaining.creativeRemainingDA} DA
                              </span>
                            </>
                          ) : (
                            <span className={styles.capacityEmpty}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className={styles.calendarBody} style={{ height: canvasHeight }}>
                {isOutOfDataRange ? (
                  <div className={styles.emptyTimelineNotice}>Khong co du lieu</div>
                ) : (
                  <>
                    {todayIndex >= 0 && (
                      <div
                        className={styles.todayLine}
                        style={{
                          left: todayIndex * dayWidth + dayWidth / 2,
                          height: canvasHeight,
                        }}
                      />
                    )}

                    {months.slice(1).map((month) => {
                      const left = getMonthScrollLeft(days, month.key, dayWidth);
                      return (
                        <div
                          key={`divider-${month.key}`}
                          className={styles.monthDivider}
                          style={{ left, height: canvasHeight }}
                        />
                      );
                    })}

                    {monthScopedProjects.map((project, rowIndex) => (
                      <TimelineRow
                        key={project.id}
                        project={project}
                        blocks={projectLayouts[rowIndex]?.blocks ?? []}
                        days={days}
                        weekendDays={weekendDays}
                        todayIndex={todayIndex}
                        dayWidth={dayWidth}
                        rowIndex={rowIndex}
                        top={rowOffsets[rowIndex] ?? 0}
                        rowHeight={projectLayouts[rowIndex]?.rowHeight ?? TRACKER_ROW_HEIGHT}
                      />
                    ))}

                    {Array.from({ length: emptyRowCount }, (_, index) => {
                      const rowIndex = monthScopedProjects.length + index;
                      return (
                        <EmptyTimelineRow
                          key={`empty-timeline-${index}`}
                          days={days}
                          weekendDays={weekendDays}
                          todayIndex={todayIndex}
                          dayWidth={dayWidth}
                          rowIndex={rowIndex}
                          top={totalProjectsHeight + index * TRACKER_ROW_HEIGHT}
                        />
                      );
                    })}
                  </>
                )}
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
      style={{ height: TRACKER_ROW_HEIGHT, minHeight: TRACKER_ROW_HEIGHT }}
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
  dayWidth: number;
  rowIndex: number;
  top: number;
}

function EmptyTimelineRow({
  days,
  weekendDays,
  todayIndex,
  dayWidth,
  rowIndex,
  top,
}: EmptyTimelineRowProps) {
  return (
    <div
      className={classNames(
        styles.timelineRow,
        rowIndex % 2 === 0 ? styles.timelineRowOdd : styles.timelineRowEven,
      )}
      style={{ top, width: days.length * dayWidth, height: TRACKER_ROW_HEIGHT }}
      aria-hidden
    >
      {weekendDays.map((day) => {
        const index = getDayIndex(days, day.date);
        return (
          <div
            key={`we-empty-${rowIndex}-${day.key}`}
            className={styles.weekendShade}
            style={{ left: index * dayWidth, width: dayWidth }}
          />
        );
      })}

      {todayIndex >= 0 && (
        <div
          className={styles.todayShade}
          style={{ left: todayIndex * dayWidth, width: dayWidth }}
        />
      )}
    </div>
  );
}

interface TimelineRowProps {
  project: TrackerProject;
  blocks: LaidOutBlock[];
  days: CalendarDay[];
  weekendDays: CalendarDay[];
  todayIndex: number;
  dayWidth: number;
  rowIndex: number;
  top: number;
  rowHeight: number;
}

function TimelineRow({
  project,
  blocks,
  days,
  weekendDays,
  todayIndex,
  dayWidth,
  rowIndex,
  top,
  rowHeight,
}: TimelineRowProps) {
  const navigate = useNavigate();
  return (
    <div
      className={classNames(
        styles.timelineRow,
        rowIndex % 2 === 0 ? styles.timelineRowOdd : styles.timelineRowEven,
      )}
      style={{ top, width: days.length * dayWidth, height: rowHeight }}
    >
      {weekendDays.map((day) => {
        const index = getDayIndex(days, day.date);
        return (
          <div
            key={`we-${project.id}-${day.key}`}
            className={styles.weekendShade}
            style={{ left: index * dayWidth, width: dayWidth }}
          />
        );
      })}

      {todayIndex >= 0 && (
        <div
          className={styles.todayShade}
          style={{ left: todayIndex * dayWidth, width: dayWidth }}
        />
      )}

      {blocks.map((block, index) => (
        <TimelineBlock
          key={`${project.id}-${index}`}
          project={project}
          block={block}
          days={days}
          dayWidth={dayWidth}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

interface TimelineBlockProps {
  project: TrackerProject;
  block: LaidOutBlock;
  days: CalendarDay[];
  dayWidth: number;
  navigate: NavigateFunction;
}

function TimelineBlock({ project, block, days, dayWidth, navigate }: TimelineBlockProps) {
  const position = getBlockPosition(days, block.start, block.end, dayWidth);
  if (!position) return null;

  const isProjectBar = isProjectTimelineBar(block, project.name);
  const taskName = isProjectBar
    ? undefined
    : parseTrackerTaskBaseLabel(block.label, block.quantity);
  const ariaLabel = isProjectBar
    ? `Open project ${project.name}`
    : `View ${taskName ?? block.label} tasks for ${project.name}`;

  const handleOpen = () => {
    if (isProjectBar) {
      navigate(buildProjectDetailPath(project.id));
      return;
    }
    const taskMonth = dayjs(block.start).isValid()
      ? dayjs(block.start).format('YYYY-MM')
      : undefined;
    navigate(
      buildProjectTasksPath({
        projectName: project.name,
        search: taskName,
        outputMetric: taskName ? inferOutputMetricFromTaskName(taskName) : undefined,
        outputMonth: taskMonth,
      }),
    );
  };

  return (
    <Tooltip
      title={block.label}
      mouseEnterDelay={0}
      mouseLeaveDelay={0.04}
      placement="right"
      arrow={false}
      destroyOnHidden
      classNames={{ root: styles.blockTooltip }}
      styles={{
        container: {
          padding: '5px 9px',
          fontSize: 11,
          lineHeight: 1.3,
          fontWeight: 500,
          letterSpacing: '0.01em',
          color: '#0f172a',
          background: 'rgb(255 255 255 / 96%)',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          boxShadow: '0 2px 10px rgb(15 23 42 / 10%)',
        },
      }}
    >
      <div
        role="link"
        tabIndex={0}
        aria-label={ariaLabel}
        className={classNames(styles.block, styles.blockClickable, styles[block.type])}
        style={{
          left: position.left,
          width: Math.max(position.width, 18),
          top: getBlockTop(block.lane),
          height: TRACKER_BLOCK_HEIGHT,
        }}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
      >
        <span>{block.label}</span>
      </div>
    </Tooltip>
  );
}
