/** Case-insensitive project name key for archive checks. */
export function normalizeProjectNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function buildArchivedProjectNameKeys(
  projects: readonly { name: string }[] | undefined,
): Set<string> {
  const keys = new Set<string>();
  for (const project of projects ?? []) {
    const key = normalizeProjectNameKey(project.name);
    if (key) keys.add(key);
  }
  return keys;
}

export function isArchivedProjectName(name: string, archivedKeys: Set<string>): boolean {
  const key = normalizeProjectNameKey(name);
  return key !== '' && archivedKeys.has(key);
}

/** Drop names that match an archived project (historic task names, free-text, etc.). */
export function filterOutArchivedProjectNames(
  names: readonly string[],
  archivedKeys: Set<string>,
): string[] {
  return names.filter((name) => !isArchivedProjectName(name, archivedKeys));
}

export const ARCHIVED_PROJECT_CREATE_TASK_MESSAGE = 'Không chọn được dự án đã lưu trữ';
