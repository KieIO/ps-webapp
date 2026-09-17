/** Seed data + in-memory store for task score catalog (dev mock). */
import type { TaskScore } from '../schemas/taskScore.schema';

const SEED_DATE = '2024-01-01T00:00:00.000Z';

const GROUP_DEPARTMENT: Record<string, string | null> = {
  implementation: 'project',
  quality_control: 'creative',
  edit_others: null,
};

const buildLeveledTasks = (
  baseName: string,
  scoresByLevel: readonly number[],
  group: string,
  startSortOrder: number,
  slug: string,
): { items: TaskScore[]; nextSortOrder: number } => {
  const department = GROUP_DEPARTMENT[group] ?? null;
  const items = scoresByLevel.map((score, index) => {
    const level = index + 1;
    return {
      id: `task-score-${slug}-${level}`,
      name: `${baseName} ${level}`,
      taskType: baseName,
      score,
      group,
      department,
      sortOrder: startSortOrder + index,
      createdAt: SEED_DATE,
    };
  });

  return { items, nextSortOrder: startSortOrder + scoresByLevel.length };
};

const buildInitialTaskScores = (): TaskScore[] => {
  let sortOrder = 0;
  const items: TaskScore[] = [];

  const add = (baseName: string, scores: readonly number[], group: string, slug: string) => {
    const built = buildLeveledTasks(baseName, scores, group, sortOrder, slug);
    items.push(...built.items);
    sortOrder = built.nextSortOrder;
  };

  add('Slides', [10, 30, 45, 90, 180], 'implementation', 'slides');
  add('Slide master', [5, 15, 30, 45, 90], 'implementation', 'slide-master');
  add('Convert', [5, 10, 30, 60, 90], 'implementation', 'convert');
  add('Edit Feedback', [35, 44, 58, 58, 58], 'implementation', 'edit-feedback');
  add('QA', [35, 44, 58, 58, 58], 'quality_control', 'qa');
  add('Calameo', [35, 44, 58, 58, 58], 'implementation', 'calameo');
  add('Others', [35, 44, 58, 58, 58], 'implementation', 'others');
  add('Word', [35, 44, 58, 58, 58], 'implementation', 'word');
  add('Redo slide', [35, 44, 58, 58, 58], 'edit_others', 'redo-slide');
  add('Rework', [35, 44, 58, 58, 58], 'edit_others', 'rework');
  add('Animation', [5, 15, 30, 45, 90], 'implementation', 'animation');
  add('DA', [360, 480, 720, 960, 1200], 'implementation', 'da');
  add('Edit DA', [35, 44, 58, 58, 58], 'implementation', 'edit-da');
  add('Complicated Animation', [45, 90, 90], 'implementation', 'complicated-animation');
  add('Motion graphic', [35, 44, 58, 58, 58], 'implementation', 'motion-graphic');
  add('Graphic/Illustration', [35, 44, 58, 58, 58], 'implementation', 'graphic-illustration');
  add('Edit Feedback DE', [35, 44, 58, 58, 58], 'implementation', 'edit-feedback-de');
  add('Showreel', [35, 44, 58, 58, 58], 'implementation', 'showreel');
  add('Rework DA', [360, 480, 720, 960], 'implementation', 'rework-da');
  add('Supervise DE', [35, 44, 58, 58, 58], 'edit_others', 'supervise-de');

  return items;
};

export const INITIAL_TASK_SCORES: TaskScore[] = buildInitialTaskScores();

let taskScoresStore = [...INITIAL_TASK_SCORES];

export const getMockTaskScoresStore = () => taskScoresStore;
export const setMockTaskScoresStore = (next: TaskScore[]) => {
  taskScoresStore = next;
};
