/**
 * Zod schemas for My Tasks API responses.
 * Backend contract: docs/MY_TASKS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import { z } from 'zod';
import {
  PROJECT_DEPARTMENTS,
  PROJECT_STATUSES,
  PROJECT_URGENCIES,
} from '@/features/projects/schemas/project.schema';
import { TASK_CONFIRMATION_STATUSES } from '@/shared/constants/taskConfirmation';
import {
  isRevisionDeadlineOnOrAfterWorkDate,
  REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE,
} from '../utils/taskRevision';

export {
  TASK_CONFIRMATION_STATUSES,
  type TaskConfirmationStatus,
} from '@/shared/constants/taskConfirmation';

export const CLASSIFICATION_LEVELS = [1, 2, 3, 4] as const;

export const TASK_CATEGORIES = ['project', 'non_project'] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

/** Project-vs-Creative assign pipeline (independent of `taskCategory`). */
export const TASK_WORKFLOW_KINDS = ['project', 'creative'] as const;

export type TaskWorkflowKind = (typeof TASK_WORKFLOW_KINDS)[number];

export const ASSIGN_DIRECTIONS = ['project_staff', 'creative_department'] as const;

export type AssignDirection = (typeof ASSIGN_DIRECTIONS)[number];

export const STAFF_AVAILABILITIES = ['free', 'normal', 'overloaded', 'on_leave'] as const;

export type StaffAvailability = (typeof STAFF_AVAILABILITIES)[number];

/** Post-create Creative pipeline after PM hands the task to CH. */
export const CREATIVE_PIPELINE_STAGES = [
  'awaiting_ch',
  'awaiting_cm',
  'assigned_staff',
  'split',
] as const;

export type CreativePipelineStage = (typeof CREATIVE_PIPELINE_STAGES)[number];

export const BRIEF_OWNERS = ['pm', 'ch'] as const;

export type BriefOwner = (typeof BRIEF_OWNERS)[number];

export const CREATIVE_ASSIGN_MODES = ['whole', 'split'] as const;

export type CreativeAssignMode = (typeof CREATIVE_ASSIGN_MODES)[number];

/**
 * Distinguishes original work, CM split children, and revision rework subtasks.
 * Legacy rows without `taskKind`: treat `parentTaskId` as split.
 */
export const TASK_KINDS = ['original', 'split', 'revision'] as const;

export type TaskKind = (typeof TASK_KINDS)[number];

export const TASK_DEPARTMENTS = PROJECT_DEPARTMENTS;

export type TaskDepartment = (typeof TASK_DEPARTMENTS)[number];

export type ClassificationLevel = (typeof CLASSIFICATION_LEVELS)[number];

export const TaskPersonSchema = z.object({
  code: z.string(),
  name: z.string(),
  userId: z.string().nullish(),
});

export const TaskAssigneeSchema = TaskPersonSchema.extend({
  userId: z.string().nullish(),
  /** Present on staff-options responses — used to filter assignees by task department. */
  department: z.string().nullish(),
  /** Assign picker: on leave cannot be selected; Overloaded is allowed (may show >100%). */
  availability: z.enum(STAFF_AVAILABILITIES).optional(),
  /** Optional role hint for CM vs Staff pickers. */
  role: z.string().optional(),
});

export const MyTaskSchema = z.object({
  id: z.string(),
  taskCategory: z.enum(TASK_CATEGORIES),
  taskCode: z.string(),
  /** Linked project record id — present for project tasks when API provides it. */
  projectId: z.string().nullish(),
  projectName: z.string(),
  projectManager: TaskPersonSchema,
  taskName: z.string(),
  level: z.coerce.number().min(1).max(4),
  /** Backend stores quantity as float64 (partial slides/units allowed). */
  quantity: z.number().min(0),
  /** UTC start of the task calendar day (00:00:00). */
  date: z.string(),
  /** UTC end of the task calendar day (23:59:59), when provided by API. */
  deadline: z.string().nullish(),
  /** Internal deadline dedicated for Creative department tasks. */
  creativeDeadline: z.string().nullish(),
  description: z.string(),
  staff: z.array(TaskAssigneeSchema),
  /** Phòng ban of the task — required for new project tasks. */
  department: z.string().min(1).nullish(),
  workflowKind: z.enum(TASK_WORKFLOW_KINDS).optional(),
  assignDirection: z.enum(ASSIGN_DIRECTIONS).optional(),
  pipelineStage: z.enum(CREATIVE_PIPELINE_STAGES).optional(),
  briefOwner: z.enum(BRIEF_OWNERS).optional(),
  cmNote: z.string().optional(),
  parentTaskId: z.string().nullish(),
  /** original | split | revision — optional for backward-compatible API payloads. */
  taskKind: z.enum(TASK_KINDS).optional(),
  /** 1-based round when taskKind is revision. */
  revisionRound: z.number().int().min(1).nullish(),
  /** Feedback / reason captured when the revision subtask was created. */
  revisionReason: z.string().nullish(),
  /**
   * How many revision children this task has.
   * Present on original/split parents; 0 / omitted on revision rows.
   */
  revisionChildCount: z.number().int().min(0).optional(),
  /**
   * Open revisions (not_updated | confirmed | decline) that block parent
   * update status / edit / evaluate.
   */
  activeRevisionChildCount: z.number().int().min(0).optional(),
  creativeManager: TaskPersonSchema.optional(),
  /** Set when the task is handed to a staff member (15-minute confirm SLA). */
  assignedAt: z.string().nullish(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  completionPercent: z.number().min(0).max(100).nullish(),
  pmEvaluation: z.string(),
  pmNote: z.string(),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  /** Linked overtime request when this task was created from OT assign-task. */
  overtimeRequestId: z.string().nullish(),
  /** Actual hours worked — required when finishing an OT-linked task. */
  actualHours: z.number().nullish(),
  /** Stored setting — `auto` lets the API/UI derive display color from deadline. */
  urgency: z.enum(PROJECT_URGENCIES).optional().default('auto'),
  updatedAt: z.string().nullish(),
  /** Set when status becomes finished. */
  completedAt: z.string().nullish(),
  /** Denormalized project fields — populated by API or mock for Department Head columns. */
  projectStartDate: z.string().nullish(),
  projectEndDate: z.string().nullish(),
  projectLevel: z.number().int().min(1).max(4).nullish(),
  projectBrief: z.string().nullish(),
  projectVolume: z.number().int().min(1).max(4).nullish(),
  projectNature: z.number().int().min(1).max(4).nullish(),
  projectTime: z.number().int().min(1).max(4).nullish(),
  projectStatus: z.enum(PROJECT_STATUSES).nullish(),
  projectFinishedDate: z.string().nullish(),
});

export const MyTaskListFiltersSchema = z.object({
  taskCategory: z.enum(TASK_CATEGORIES).optional(),
  search: z.string().optional(),
  projectName: z.string().optional(),
  staffName: z.string().optional(),
  confirmation: z.enum(TASK_CONFIRMATION_STATUSES).optional(),
  timeliness: z.enum(['completed', 'on_time', 'not_on_time']).optional(),
  completedMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  outputMetric: z.enum(['project_slides', 'creative_da']).optional(),
  outputMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  /**
   * Calendar day (YYYY-MM-DD). Keeps tasks whose work window includes this day:
   * `date` ≤ workDate ≤ deadline.
   */
  workDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  /** Client-side filter: only tasks linked to an overtime request. */
  otOnly: z.boolean().optional(),
});

export const MyTaskListResponseSchema = z.object({
  items: z.array(MyTaskSchema),
  total: z.number(),
});

export const TASK_HISTORY_KINDS = ['event', 'deadline'] as const;

export const TaskHistoryEventSchema = z.object({
  id: z.string(),
  occurredAt: z.string(),
  description: z.string(),
  completed: z.boolean(),
  kind: z.enum(TASK_HISTORY_KINDS),
});

export const TaskHistoryListResponseSchema = z.object({
  items: z.array(TaskHistoryEventSchema),
});

export const QualityReviewSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  reviewerId: z.string(),
  reviewerName: z.string(),
  revisionCount: z.number().int().min(0),
  comment: z.string(),
  createdAt: z.string(),
});

export const QualityReviewListResponseSchema = z.object({
  items: z.array(QualityReviewSchema),
});

export const CreateQualityReviewRequestSchema = z.object({
  revisionCount: z.number().int().min(0, 'Revision count must be >= 0'),
  comment: z.string().optional().default(''),
});

/**
 * Create a revision subtask under the task being revised.
 * Assignee is always the parent task’s current staff (locked — not in payload).
 *
 * Quantity policy (Option A): may be lower, equal, or higher than the parent task.
 * Only constraint is quantity > 0. Higher quantity intentionally increases revision workload/capacity.
 */
export const CreateRevisionRequestSchema = z
  .object({
    revisionReason: z.string().trim().min(1, 'Nhập lý do / nội dung revision'),
    /** Rework scope units — independent of parent quantity (can be partial or expanded). */
    quantity: z.number().positive('Số lượng phải lớn hơn 0'),
    level: z.number().int().min(1).max(4),
    /** Calendar day used for capacity workload (YYYY-MM-DD or ISO). */
    date: z.string().min(1, 'Chọn ngày tính capacity'),
    /** Resubmission deadline (ISO datetime). */
    deadline: z.string().min(1, 'Chọn deadline nộp lại'),
  })
  .refine((data) => isRevisionDeadlineOnOrAfterWorkDate(data.date, data.deadline), {
    message: REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE,
    path: ['deadline'],
  });

export const RevisionListResponseSchema = z.object({
  items: z.array(MyTaskSchema),
  total: z.number(),
});

export const CreateMyTaskRequestSchema = z.object({
  taskCategory: z.enum(TASK_CATEGORIES),
  projectName: z.string().min(1, 'Project name is required'),
  projectManager: TaskPersonSchema,
  taskName: z.string().min(1, 'Task name is required'),
  level: z.number().int().min(1).max(4),
  quantity: z.number().min(0),
  date: z.string(),
  description: z.string(),
  department: z.string().min(1).optional(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  staff: z.array(TaskAssigneeSchema).max(1, 'Only one staff member can be assigned'),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  /** Persisted urgency — defaults from deadline when omitted on create. */
  urgency: z.enum(PROJECT_URGENCIES),
  creativeDeadline: z.string().optional(),
  workflowKind: z.enum(TASK_WORKFLOW_KINDS).optional(),
  assignDirection: z.enum(ASSIGN_DIRECTIONS).optional(),
});

export const UpdateMyTaskStatusRequestSchema = z.object({
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  actualHours: z.number().positive().optional(),
});

export const UpdateMyTaskPmEvaluationRequestSchema = z.object({
  completionPercent: z.number().min(0).max(100),
  pmEvaluation: z.string(),
  pmNote: z.string(),
});

export const AssignMyTaskRequestSchema = z.object({
  staff: z
    .array(TaskAssigneeSchema)
    .min(1, 'Select a staff member')
    .max(1, 'Only one staff member can be assigned'),
  staffNote: z.string(),
});

export const AssignCreativeHeadRequestSchema = z.object({
  cmUserId: z.string().min(1, 'Chọn Creative Manager'),
  description: z.string().optional(),
  designThinking: z.number().int().min(1).max(4).optional(),
  technical: z.number().int().min(1).max(4).optional(),
  contentProcessing: z.number().int().min(1).max(4).optional(),
  cmNote: z.string().optional(),
  /** Creative-department deadline; omit to default to Admin/PM deadline on the server. */
  creativeDeadline: z.string().optional(),
  /** Only applied when CH fills a creative-origin brief. */
  urgency: z.enum(PROJECT_URGENCIES).optional(),
});

export const CreativeManagerSubtaskSchema = z.object({
  name: z.string().min(1, 'Tên task nhỏ is required'),
  staffUserId: z.string().min(1, 'Chọn Staff'),
  quantity: z.number().positive('Nhập số lượng > 0'),
  description: z.string().min(1, 'Nhập brief cho task nhỏ'),
  /** Optional CM creative deadline for this part. */
  creativeDeadline: z.string().optional(),
});

export const AssignCreativeManagerRequestSchema = z
  .object({
    mode: z.enum(CREATIVE_ASSIGN_MODES),
    staffUserId: z.string().optional(),
    staffNote: z.string().optional(),
    /** Required when mode=whole — CM fills quantity when assigning. */
    quantity: z.number().positive('Nhập số lượng > 0').optional(),
    /** Optional CM creative deadline for whole assign. */
    creativeDeadline: z.string().optional(),
    subtasks: z.array(CreativeManagerSubtaskSchema).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'whole' && !value.staffUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['staffUserId'],
        message: 'Chọn Staff nhận task',
      });
    }
    if (value.mode === 'whole' && (value.quantity == null || value.quantity <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quantity'],
        message: 'CM nhập số lượng trước khi giao',
      });
    }
    if (value.mode === 'split' && (!value.subtasks || value.subtasks.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subtasks'],
        message: 'Chia nhỏ cần ít nhất 2 task',
      });
    }
  });

export const UpdateCreativePipelineRequestSchema = z
  .object({
    description: z.string().optional(),
    additionalFactors: z.string().optional(),
    quantity: z.number().min(0).optional(),
    /** PM deadline (InternalDeadline) — Admin/PM only. */
    deadline: z.string().nullish(),
    creativeDeadline: z.string().nullish(),
    urgency: z.enum(PROJECT_URGENCIES).optional(),
    designThinking: z.number().int().min(1).max(4).optional(),
    technical: z.number().int().min(1).max(4).optional(),
    contentProcessing: z.number().int().min(1).max(4).optional(),
    staffUserId: z.string().optional(),
    staffNote: z.string().optional(),
    /** CH/Admin: reassign CM while awaiting_cm. */
    cmUserId: z.string().optional(),
    /** Atomic SL redistribution for split family; sum must equal locked parent total. */
    childQuantities: z
      .array(
        z.object({
          id: z.string().min(1),
          quantity: z.number().positive(),
        }),
      )
      .optional(),
  })
  .superRefine((value, ctx) => {
    const levelFields = [value.designThinking, value.technical, value.contentProcessing];
    const provided = levelFields.filter((item) => item != null).length;
    if (provided > 0 && provided < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['designThinking'],
        message: 'Cần đủ 3 tiêu chí để đổi Level',
      });
    }
    if (value.cmUserId && value.staffUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cmUserId'],
        message: 'Không đổi CM và Staff trong cùng một lần lưu',
      });
    }
  });

export const UpdateMyTaskRequestSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  quantity: z.number().min(0),
  date: z.string(),
  description: z.string(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  staff: z.array(TaskAssigneeSchema).max(1, 'Only one staff member can be assigned'),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  urgency: z.enum(PROJECT_URGENCIES),
  creativeDeadline: z.string().optional(),
});

/** Department Head — project-context fields on task rows (non-project or when no linked project). */
export const UpdateHeadMyTaskRequestSchema = z.object({
  projectStartDate: z.string(),
  projectEndDate: z.string(),
  projectBrief: z.string(),
  projectVolume: z.number().int().min(1).max(4),
  projectNature: z.number().int().min(1).max(4),
  projectTime: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  pmEvaluation: z.string(),
  pmNote: z.string(),
  projectStatus: z.enum(PROJECT_STATUSES),
  projectFinishedDate: z.string().optional(),
  /** Task urgency (independent from project.urgency). */
  urgency: z.enum(PROJECT_URGENCIES),
});

export type TaskPerson = z.infer<typeof TaskPersonSchema>;
export type TaskAssignee = z.infer<typeof TaskAssigneeSchema>;
export type MyTask = z.infer<typeof MyTaskSchema>;
export type MyTaskListFilters = z.infer<typeof MyTaskListFiltersSchema>;
export type MyTaskListResponse = z.infer<typeof MyTaskListResponseSchema>;
export type TaskHistoryEvent = z.infer<typeof TaskHistoryEventSchema>;
export type TaskHistoryListResponse = z.infer<typeof TaskHistoryListResponseSchema>;
export type QualityReview = z.infer<typeof QualityReviewSchema>;
export type QualityReviewListResponse = z.infer<typeof QualityReviewListResponseSchema>;
export type CreateQualityReviewRequest = z.infer<typeof CreateQualityReviewRequestSchema>;
export type CreateRevisionRequest = z.infer<typeof CreateRevisionRequestSchema>;
export type RevisionListResponse = z.infer<typeof RevisionListResponseSchema>;
export type CreateMyTaskRequest = z.infer<typeof CreateMyTaskRequestSchema>;
export type UpdateMyTaskStatusRequest = z.infer<typeof UpdateMyTaskStatusRequestSchema>;
export type UpdateMyTaskPmEvaluationRequest = z.infer<typeof UpdateMyTaskPmEvaluationRequestSchema>;
export type AssignMyTaskRequest = z.infer<typeof AssignMyTaskRequestSchema>;
export type AssignCreativeHeadRequest = z.infer<typeof AssignCreativeHeadRequestSchema>;
export type CreativeManagerSubtask = z.infer<typeof CreativeManagerSubtaskSchema>;
export type AssignCreativeManagerRequest = z.infer<typeof AssignCreativeManagerRequestSchema>;
export type UpdateCreativePipelineRequest = z.infer<typeof UpdateCreativePipelineRequestSchema>;
export type UpdateMyTaskRequest = z.infer<typeof UpdateMyTaskRequestSchema>;
export type UpdateHeadMyTaskRequest = z.infer<typeof UpdateHeadMyTaskRequestSchema>;
