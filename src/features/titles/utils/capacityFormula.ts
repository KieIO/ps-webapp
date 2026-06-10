export const computeSpecialistTaskPoints = (
  dailyCapacityPoints: number,
  taskConversionRatio: number,
): number => Math.round((dailyCapacityPoints * taskConversionRatio) / 100);
