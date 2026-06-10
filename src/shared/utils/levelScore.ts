/** Rounded average of three scores, clamped to [min, max]. */
export const computeAverageLevel = (
  first: number,
  second: number,
  third: number,
  min: number,
  max: number,
): number => {
  const average = Math.round((first + second + third) / 3);
  return Math.min(max, Math.max(min, average));
};
