/** Slugify a department name into a stable code (lowercase + underscores). */
export const slugifyDepartmentCode = (name: string): string => {
  let slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);

  if (!slug) return 'department';
  if (!/^[a-z]/.test(slug)) {
    slug = `d_${slug}`.slice(0, 50);
  }
  return slug;
};
