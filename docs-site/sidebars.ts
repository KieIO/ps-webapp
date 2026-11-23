import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'FAQ',
      collapsed: false,
      items: ['faq'],
    },
    {
      type: 'category',
      label: 'Changelog',
      collapsed: false,
      items: ['product-changelog'],
    },
    {
      type: 'category',
      label: 'Go-live',
      collapsed: false,
      items: ['go-live-plan'],
    },
    {
      type: 'category',
      label: 'Quản lý Tracker',
      collapsed: false,
      items: [
        'tracker-timeline',
        'tracker-remaining',
        'tracker-workload',
        'milestone-flow',
        'tracker-urgency',
        'tracker-team-bar',
        'tracker-total-slides',
        'tracker-on-leave',
        'project-task-views',
      ],
    },
    {
      type: 'category',
      label: 'Quản lý Projects',
      collapsed: false,
      items: [
        'project-pm-edit',
        {
          type: 'link',
          label: 'Mốc giao',
          href: '/milestone',
        },
      ],
    },
    {
      type: 'category',
      label: 'Quản lý Task',
      collapsed: false,
      // Theo vòng đời: tạo → status → assignee → đánh giá → chia → revision → on-time
      items: [
        'create-task-flow',
        'task-status',
        'task-assignee-display',
        'task-evaluation',
        'split-task-flow',
        'revision-flow',
        'on-time-rate',
      ],
    },
    {
      type: 'category',
      label: 'Quản lý Users',
      collapsed: false,
      items: ['user-create', 'user-assign-position', 'user-status', 'leave-flow'],
    },
    {
      type: 'category',
      label: 'Quản lý OT',
      collapsed: false,
      items: ['ot-request', 'ot-approve', 'ot-attach-task', 'ot-work', 'ot-review', 'ot-tracking'],
    },
    {
      type: 'category',
      label: 'Quản lý chức vụ',
      collapsed: false,
      items: ['title-crud', 'title-capacity', 'title-user-sync'],
    },
    {
      type: 'category',
      label: 'Quản lý phòng ban',
      collapsed: false,
      items: ['department-crud', 'department-assign-user', 'department-scope'],
    },
    {
      type: 'category',
      label: 'Quản lý khách hàng',
      collapsed: false,
      items: ['client-crud', 'client-assign-project', 'client-knowledge'],
    },
    {
      type: 'category',
      label: 'Quản lý công thức capacity',
      collapsed: false,
      items: ['capacity-daily', 'capacity-ratio', 'capacity-task-points', 'capacity-tracker'],
    },
    {
      type: 'category',
      label: 'Quản lý điểm của task',
      collapsed: false,
      items: ['task-score-config', 'task-score-usage'],
    },
  ],
};

export default sidebars;
