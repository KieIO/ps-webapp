import { Tabs } from 'antd';
import { JobGroupList } from '../JobGroupList/JobGroupList';
import { JobLevelList } from '../JobLevelList/JobLevelList';
import { JobTitleList } from '../JobTitleList/JobTitleList';

export function TitleManagementPanel() {
  return (
    <Tabs
      defaultActiveKey="titles"
      items={[
        {
          key: 'titles',
          label: 'Job titles',
          children: <JobTitleList />,
        },
        {
          key: 'levels',
          label: 'Job levels',
          children: <JobLevelList />,
        },
        {
          key: 'groups',
          label: 'Job groups',
          children: <JobGroupList />,
        },
      ]}
    />
  );
}
