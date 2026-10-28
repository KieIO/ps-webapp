import type { TaskConfirmationStatus } from '../schemas/task.schema';
import type { MyTask } from '../schemas/task.schema';
import {
  isSplitChildTask,
  isSplitParentTask,
  resolveEffectivePipelineStage,
  type CreativeCmQueueFrame,
  type CreativeQueueView,
} from './creativePipeline';
import { hasCmEvaluation } from './evaluationRemainder';
import { hasHandoffEvaluation, isCreativeWholeAssigned } from './taskEvaluation';

/** How the Creative work unit was handed to Staff (or not yet). */
export type CreativeAssignShapeFilter = 'all' | 'pending_staff' | 'whole' | 'split' | 'split_child';

export type CreativeEvaluationFilter = 'all' | 'evaluated' | 'not_evaluated';

export type CreativeQueueListFilters = {
  search?: string;
  projectName?: string;
  assignShape?: CreativeAssignShapeFilter;
  splitFrom?: string;
  splitTo?: string;
  evaluation?: CreativeEvaluationFilter;
  confirmation?: TaskConfirmationStatus;
};

export const EMPTY_CREATIVE_QUEUE_FILTERS: CreativeQueueListFilters = {
  assignShape: 'all',
  evaluation: 'all',
};

export const CREATIVE_ASSIGN_SHAPE_OPTIONS: {
  value: CreativeAssignShapeFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending_staff', label: 'Chưa giao Staff' },
  { value: 'whole', label: 'Giao nguyên' },
  { value: 'split', label: 'Đã chia nhỏ' },
  { value: 'split_child', label: 'Task nhỏ' },
];

export const CREATIVE_EVALUATION_OPTIONS_HANDOFF: {
  value: CreativeEvaluationFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'evaluated', label: 'Đã đánh giá gói CM' },
  { value: 'not_evaluated', label: 'Chưa đánh giá gói CM' },
];

export const CREATIVE_EVALUATION_OPTIONS_STAFF: {
  value: CreativeEvaluationFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'evaluated', label: 'Đã đánh giá Staff' },
  { value: 'not_evaluated', label: 'Chưa đánh giá Staff' },
];

export type CreativeQueueFilterVisibility = {
  showAssignShape: boolean;
  showSplitDate: boolean;
  showEvaluation: boolean;
  showConfirmation: boolean;
  /** CH board uses handoff scores; CM execution uses staff scores. */
  evaluationLayer: 'handoff' | 'staff' | null;
  assignShapeOptions: CreativeAssignShapeFilter[];
};

export const resolveCreativeQueueFilterVisibility = (
  view: CreativeQueueView,
  cmFrame: CreativeCmQueueFrame,
  filters: CreativeQueueListFilters,
): CreativeQueueFilterVisibility => {
  if (view === 'ch') {
    const shape = filters.assignShape ?? 'all';
    return {
      showAssignShape: true,
      showSplitDate: shape === 'split',
      showEvaluation: true,
      showConfirmation: false,
      evaluationLayer: 'handoff',
      assignShapeOptions: ['all', 'pending_staff', 'whole', 'split'],
    };
  }
  if (cmFrame === 'intake') {
    return {
      showAssignShape: false,
      showSplitDate: false,
      showEvaluation: false,
      showConfirmation: false,
      evaluationLayer: null,
      assignShapeOptions: ['all'],
    };
  }
  const shape = filters.assignShape ?? 'all';
  return {
    showAssignShape: true,
    showSplitDate: shape === 'split' || shape === 'split_child',
    showEvaluation: true,
    showConfirmation: true,
    evaluationLayer: 'staff',
    assignShapeOptions: ['all', 'whole', 'split', 'split_child'],
  };
};

const matchesSearch = (task: MyTask, search: string): boolean => {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [task.taskCode, task.taskName, task.projectName, task.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
};

const matchesAssignShape = (task: MyTask, shape: CreativeAssignShapeFilter): boolean => {
  if (shape === 'all') return true;
  if (shape === 'split_child') return isSplitChildTask(task);
  if (shape === 'split') return isSplitParentTask(task);
  if (shape === 'whole') return isCreativeWholeAssigned(task);
  if (shape === 'pending_staff') {
    if (isSplitChildTask(task)) return false;
    const stage = resolveEffectivePipelineStage(task);
    return stage === 'awaiting_ch' || stage === 'awaiting_cm';
  }
  return true;
};

/** Calendar day in local time — matches DatePicker values (YYYY-MM-DD). */
const dayKey = (iso: string | null | undefined): string | null => {
  if (!iso?.trim()) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const matchesSplitDate = (task: MyTask, from?: string, to?: string): boolean => {
  if (!from && !to) return true;
  const key = dayKey(task.splitAt);
  if (!key) return false;
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
};

const matchesEvaluation = (
  task: MyTask,
  evaluation: CreativeEvaluationFilter,
  layer: 'handoff' | 'staff' | null,
): boolean => {
  if (!layer || evaluation === 'all') return true;
  const evaluated = layer === 'handoff' ? hasHandoffEvaluation(task) : hasCmEvaluation(task);
  return evaluation === 'evaluated' ? evaluated : !evaluated;
};

/** Apply Creative queue list filters on top of an already role/view-scoped queue. */
export const applyCreativeQueueFilters = (
  tasks: MyTask[],
  filters: CreativeQueueListFilters,
  visibility: CreativeQueueFilterVisibility,
): MyTask[] => {
  const search = filters.search ?? '';
  const projectName = filters.projectName;
  const assignShape = visibility.showAssignShape ? (filters.assignShape ?? 'all') : 'all';
  const evaluation = visibility.showEvaluation ? (filters.evaluation ?? 'all') : 'all';
  const confirmation = visibility.showConfirmation ? filters.confirmation : undefined;
  const splitFrom = visibility.showSplitDate ? filters.splitFrom : undefined;
  const splitTo = visibility.showSplitDate ? filters.splitTo : undefined;

  return tasks.filter((task) => {
    if (!matchesSearch(task, search)) return false;
    if (projectName && task.projectName !== projectName) return false;
    if (!matchesAssignShape(task, assignShape)) return false;
    if (!matchesSplitDate(task, splitFrom, splitTo)) return false;
    if (!matchesEvaluation(task, evaluation, visibility.evaluationLayer)) return false;
    if (confirmation && task.staffConfirmation !== confirmation) return false;
    return true;
  });
};

/** Drop values that no longer apply after a view/frame change. */
export const sanitizeCreativeQueueFilters = (
  filters: CreativeQueueListFilters,
  visibility: CreativeQueueFilterVisibility,
): CreativeQueueListFilters => {
  const next: CreativeQueueListFilters = {
    search: filters.search,
    projectName: filters.projectName,
    assignShape: 'all',
    evaluation: 'all',
  };
  if (visibility.showAssignShape) {
    const shape = filters.assignShape ?? 'all';
    next.assignShape = visibility.assignShapeOptions.includes(shape) ? shape : 'all';
  }
  if (visibility.showEvaluation) {
    next.evaluation = filters.evaluation ?? 'all';
  }
  if (visibility.showConfirmation) {
    next.confirmation = filters.confirmation;
  }
  if (visibility.showSplitDate) {
    next.splitFrom = filters.splitFrom;
    next.splitTo = filters.splitTo;
  }
  return next;
};
