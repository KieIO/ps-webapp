import type { PersonWithCode } from '../schemas/project.schema';

export const emptyPerson = (): PersonWithCode => ({ code: '', name: '' });

/** Prefer userId for Select values — email-derived codes can collide (e.g. admin@x / admin@y → ADMIN). */
export const personSelectValue = (person: PersonWithCode | undefined): string =>
  person?.userId?.trim() || person?.code?.trim() || '';

export const findPersonOption = (
  options: PersonWithCode[],
  key: string | undefined,
): PersonWithCode | undefined => {
  const resolved = key?.trim();
  if (!resolved) return undefined;
  return (
    options.find((entry) => entry.userId === resolved) ??
    options.find((entry) => entry.code === resolved)
  );
};

/** Ensure the current person appears in Select options with a display name. */
export const mergePersonOptions = (
  options: PersonWithCode[],
  person?: PersonWithCode,
): PersonWithCode[] => {
  const personKey = personSelectValue(person);
  if (!personKey) return options;

  const others = options.filter((entry) => personSelectValue(entry) !== personKey);
  const existing = findPersonOption(options, personKey);

  return [
    {
      code: person?.code || existing?.code || '',
      name: person?.name || existing?.name || person?.code || personKey,
      userId: person?.userId ?? existing?.userId,
    },
    ...others,
  ].sort((a, b) => a.name.localeCompare(b.name));
};

/** Map people to Ant Select options keyed by userId (fallback code). */
export const toPersonSelectOptions = (options: PersonWithCode[]) =>
  options
    .map((person) => {
      const value = personSelectValue(person);
      if (!value) return null;
      return { value, label: person.name || person.code || value };
    })
    .filter((entry): entry is { value: string; label: string } => entry != null);

/** Resolve code + name + userId for API payloads from a Select value (userId or legacy code). */
export const resolvePersonRef = (
  key: string | undefined,
  options: PersonWithCode[],
  fallback?: PersonWithCode,
): PersonWithCode => {
  const resolvedKey = key?.trim() || personSelectValue(fallback);
  const match = findPersonOption(options, resolvedKey);

  return {
    code: match?.code ?? fallback?.code ?? '',
    name: match?.name ?? fallback?.name ?? '',
    userId: match?.userId ?? fallback?.userId,
  };
};

/**
 * Ant Design onFinish only returns registered field paths (e.g. `pm.userId`).
 * Merge finish values with the full store (and optional project fallback) so `code`/`name` stay set.
 */
export const resolvePersonFromForm = (
  formValue: PersonWithCode | undefined,
  storedValue: PersonWithCode | undefined,
  options: PersonWithCode[],
  projectFallback?: PersonWithCode,
): PersonWithCode =>
  resolvePersonRef(
    personSelectValue(formValue) ||
      personSelectValue(storedValue) ||
      personSelectValue(projectFallback),
    options,
    storedValue ?? formValue ?? projectFallback,
  );

export const hasPersonUserId = (person: PersonWithCode): boolean => Boolean(person.userId?.trim());
