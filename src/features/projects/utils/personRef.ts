import type { PersonWithCode } from '../schemas/project.schema';

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
