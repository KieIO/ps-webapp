import type { EmployeeCapacity } from '../schemas/capacity.schema';

/** Fallback when API omits averageCapacityPercent. Weighted: total assigned ÷ total daily capacity. */
export function computeAverageCapacityPercent(items: EmployeeCapacity[]): number {
  const working = items.filter(
    (item) =>
      item.workStatus === 'working' &&
      item.capacityPercent !== null &&
      item.dailyCapacityPoints > 0,
  );

  if (working.length === 0) {
    return 0;
  }

  const { totalAssigned, totalCapacity } = working.reduce(
    (acc, item) => {
      const dailyCapacity = item.dailyCapacityPoints;
      const assigned = (item.capacityPercent! / 100) * dailyCapacity;
      return {
        totalAssigned: acc.totalAssigned + assigned,
        totalCapacity: acc.totalCapacity + dailyCapacity,
      };
    },
    { totalAssigned: 0, totalCapacity: 0 },
  );

  return Math.round((totalAssigned / totalCapacity) * 100);
}
