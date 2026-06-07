import {
  DashboardOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  BellOutlined,
  ProjectOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  UserOutlined,
  AuditOutlined,
  EyeOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { ROUTES } from './constants';

export const SIDEBAR_ITEMS = [
  // ── All roles ──────────────────────────────────────
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: DashboardOutlined,
    permission: null, // visible to all authenticated users
  },
  {
    label: 'My Tasks',
    path: ROUTES.MY_TASKS,
    icon: CheckSquareOutlined,
    permission: null,
  },
  {
    label: 'Time Log',
    path: ROUTES.TIME_LOG,
    icon: ClockCircleOutlined,
    permission: null,
  },
  {
    label: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
    icon: BellOutlined,
    permission: null,
  },

  // ── PM / Manager section ───────────────────────────
  {
    label: 'Projects',
    path: ROUTES.PROJECTS,
    icon: ProjectOutlined,
    permission: 'MANAGE_PROJECTS' as const,
  },
  {
    label: 'Task Management',
    path: ROUTES.TASK_MANAGE,
    icon: TeamOutlined,
    permission: 'VIEW_ALL_TASKS' as const,
  },
  {
    label: 'Workload',
    path: ROUTES.WORKLOAD,
    icon: FundOutlined,
    permission: 'VIEW_WORKLOAD' as const,
  },
  {
    label: 'Quality Control',
    path: ROUTES.QUALITY,
    icon: TrophyOutlined,
    permission: 'VIEW_QUALITY' as const,
  },

  // ── Creative Head section ──────────────────────────
  {
    label: 'Creative Review',
    path: ROUTES.CREATIVE_REVIEW,
    icon: EyeOutlined,
    permission: 'REVIEW_CREATIVE_TASK' as const,
  },

  // ── Head / Admin section ───────────────────────────
  {
    label: 'Capacity',
    path: ROUTES.CAPACITY,
    icon: CalendarOutlined,
    permission: 'VIEW_CAPACITY_FULL' as const,
  },
  {
    label: 'Project Tracker',
    path: ROUTES.PROJECT_TRACKER,
    icon: BarChartOutlined,
    permission: 'VIEW_CAPACITY_FULL' as const,
  },
  {
    label: 'Performance',
    path: ROUTES.PERFORMANCE,
    icon: TrophyOutlined,
    permission: 'VIEW_PERFORMANCE' as const,
  },
  {
    label: 'Overtime',
    path: ROUTES.OVERTIME,
    icon: FieldTimeOutlined,
    permission: 'APPROVE_OT' as const,
  },
  {
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: FileTextOutlined,
    permission: 'EXPORT_REPORT' as const,
  },

  // ── Admin / HR section ─────────────────────────────
  {
    label: 'Users',
    path: ROUTES.USERS,
    icon: UserOutlined,
    permission: 'MANAGE_USERS' as const,
  },
  {
    label: 'Audit Log',
    path: ROUTES.AUDIT_LOG,
    icon: AuditOutlined,
    permission: 'VIEW_AUDIT_LOG' as const,
  },
] as const;
