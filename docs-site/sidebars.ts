import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Hỏi đáp',
      collapsed: false,
      items: ['faq'],
    },
    {
      type: 'category',
      label: 'Task',
      collapsed: false,
      // Theo vòng đời: tạo → chia → revision → đo on-time
      items: ['create-task-flow', 'split-task-flow', 'revision-flow', 'on-time-rate'],
    },
    {
      type: 'category',
      label: 'Project',
      collapsed: false,
      items: ['milestone-flow'],
    },
    {
      type: 'category',
      label: 'Nghỉ phép',
      collapsed: false,
      items: ['leave-flow'],
    },
    {
      type: 'category',
      label: 'Overtime',
      collapsed: false,
      items: ['overtime-flow'],
    },
  ],
};

export default sidebars;
