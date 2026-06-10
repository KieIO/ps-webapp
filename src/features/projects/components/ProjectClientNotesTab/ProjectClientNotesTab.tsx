import type { Project } from '../../schemas/project.schema';
import styles from './ProjectClientNotesTab.module.scss';

interface ProjectClientNotesTabProps {
  project: Project;
}

const renderSection = (title: string, content: string) => (
  <section className={styles.section}>
    <h3 className={styles.title}>{title}</h3>
    {content ? (
      <p className={styles.content}>{content}</p>
    ) : (
      <p className={styles.empty}>No content yet.</p>
    )}
  </section>
);

export function ProjectClientNotesTab({ project }: ProjectClientNotesTabProps) {
  return (
    <div>
      {renderSection('Brief', project.brief)}
      {renderSection('Evaluation', project.evaluation)}
      {renderSection('Note', project.note)}
      {renderSection('Additional Factors', project.additionalFactors)}
    </div>
  );
}
