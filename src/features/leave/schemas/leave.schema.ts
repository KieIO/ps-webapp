import { z } from 'zod';
import { TASK_CONFIRMATION_STATUSES } from '@/shared/constants/taskConfirmation';
import { USER_DEPARTMENTS } from '@/features/users/constants';
import { JOB_LEVELS, WORK_STATUSES } from '@/features/capacity/constants';

export const LEAVE_STATUSES = ['active', 'ended', 'cancelled'] as const;

export const LeaveStaffSchema = z.object({
  userId: z.string().optional(),
  code: z.string().optional(),
  name: z.string(),
});

export const LeaveReplacementCandidateSchema = z.object({
  userId: z.string(),
  name: z.string(),
  department: z.enum(USER_DEPARTMENTS),
  jobLevel: z.enum(JOB_LEVELS),
  capacityPercent: z.number().nullable(),
  workStatus: z.enum(WORK_STATUSES),
});

export const LeaveAffectedTaskSchema = z.object({
  id: z.string(),
  taskCode: z.string(),
  taskName: z.string(),
  projectName: z.string(),
  date: z.string(),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  currentStaff: z.array(LeaveStaffSchema),
  otherStaffCount: z.number(),
  replacementCandidates: z.array(LeaveReplacementCandidateSchema),
});

export const LeavePreviewResponseSchema = z.object({
  tasks: z.array(LeaveAffectedTaskSchema),
  totalAffected: z.number(),
});

export const LeaveReassignmentRequestSchema = z.object({
  taskId: z.string(),
  replacementUserId: z.string().nullable().optional(),
});

export const CreateLeaveRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
  reassignments: z.array(LeaveReassignmentRequestSchema).optional(),
});

export const LeaveRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
  status: z.enum(LEAVE_STATUSES),
  createdById: z.string(),
  createdAt: z.string(),
});

export const PendingReactivationSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  leaveId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export type LeaveAffectedTask = z.infer<typeof LeaveAffectedTaskSchema>;
export type LeavePreviewResponse = z.infer<typeof LeavePreviewResponseSchema>;
export type CreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;
export type LeaveRecord = z.infer<typeof LeaveRecordSchema>;
export type PendingReactivation = z.infer<typeof PendingReactivationSchema>;
export type LeaveReplacementCandidate = z.infer<typeof LeaveReplacementCandidateSchema>;
