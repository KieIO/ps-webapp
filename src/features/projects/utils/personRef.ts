import type { PersonWithCode } from '../schemas/project.schema';

export const emptyPerson = (): PersonWithCode => ({ code: '', name: '' });

/** Ensure the current person appears in Select options with a display name. */
export const mergePersonOptions = (
  options: PersonWithCode[],
  person?: PersonWithCode,
): PersonWithCode[] => {
  if (!person?.code) return options;

  const others = options.filter((entry) => entry.code !== person.code);
  const existing = options.find((entry) => entry.code === person.code);

  return [
    {
      code: person.code,
      name: person.name || existing?.name || person.code,
      userId: person.userId ?? existing?.userId,
    },
    ...others,
  ].sort((a, b) => a.name.localeCompare(b.name));
};

/** Resolve code + name + userId for API payloads when the form only binds the code field. */
export const resolvePersonRef = (
  code: string | undefined,
  options: PersonWithCode[],
  fallback?: PersonWithCode,
): PersonWithCode => {
  const resolvedCode = code ?? fallback?.code ?? '';
  const match = options.find((entry) => entry.code === resolvedCode);

  return {
    code: resolvedCode,
    name: match?.name ?? fallback?.name ?? '',
    userId: match?.userId ?? fallback?.userId,
  };
};

/**
 * Ant Design onFinish only returns registered field paths (e.g. `pm.code`).
 * Merge finish values with the full store (and optional project fallback) so `userId` is kept.
 */
export const resolvePersonFromForm = (
  formValue: PersonWithCode | undefined,
  storedValue: PersonWithCode | undefined,
  options: PersonWithCode[],
  projectFallback?: PersonWithCode,
): PersonWithCode =>
  resolvePersonRef(
    formValue?.code ?? storedValue?.code ?? projectFallback?.code,
    options,
    storedValue ?? formValue ?? projectFallback,
  );

export const hasPersonUserId = (person: PersonWithCode): boolean => Boolean(person.userId?.trim());
