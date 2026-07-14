import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ProjectsList } from '@/features/projects/components/ProjectsList/ProjectsList';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';

export default function ArchivedProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Dự án đã lưu trữ"
        subtitle="Các dự án đã hoàn tất hoặc không còn theo dõi trong danh sách chính"
        actions={
          <Link to={ROUTES.PROJECTS}>
            <Button icon={<ArrowLeftOutlined />}>Quay lại dự án</Button>
          </Link>
        }
      />
      <ProjectsList archivedView />
    </div>
  );
}
