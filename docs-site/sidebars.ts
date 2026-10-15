import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Task',
      collapsed: false,
      items: ['create-task-flow', 'on-time-rate', 'revision-flow', 'split-task-flow'],
    },
    {
      type: 'category',
      label: 'Overtime',
      collapsed: false,
      items: ['overtime-flow'],
    },
    {
      type: 'category',
      label: 'Leave',
      collapsed: false,
      items: ['leave-flow'],
    },
    {
      type: 'category',
      label: 'Project',
      collapsed: false,
      items: ['milestone-flow'],
    },
  ],
};

export default sidebars;
