import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Task',
      collapsed: false,
      items: ['create-task-flow', 'on-time-rate'],
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
