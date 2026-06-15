import { Button } from 'antd';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { buildProjectDetailPath } from '@/config/constants';
import linkStyles from '../UserNameLink/UserNameLink.module.scss';

interface ProjectNameLinkProps {
  name: string;
  projectId?: string | null;
  className?: string;
  emptyClassName?: string;
}

export function ProjectNameLink({
  name,
  projectId,
  className,
  emptyClassName,
}: ProjectNameLinkProps) {
  const navigate = useNavigate();

  if (!name) {
    return emptyClassName ? <span className={emptyClassName}>—</span> : null;
  }

  if (!projectId) {
    return <span className={classNames(linkStyles.name, className)}>{name}</span>;
  }

  return (
    <Button
      type="link"
      className={classNames(linkStyles.link, className)}
      onClick={() => navigate(buildProjectDetailPath(projectId))}
    >
      <span className={linkStyles.name}>{name}</span>
    </Button>
  );
}
