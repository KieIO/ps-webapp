/** Compare optional department values (null / undefined treated as unset). */
export function sameDepartment(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return (a ?? null) === (b ?? null);
}
