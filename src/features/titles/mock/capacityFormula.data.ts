/** Dev seed only — default capacity/ratio by title code family. Not used when `VITE_USE_TITLES_MOCK=false`. */
import { getJobTitleFamilyKey, getJobTitleLevelNumber } from '../constants';
import { computeSpecialistTaskPoints } from '../utils/capacityFormula';

export interface CapacityFormulaValues {
  dailyCapacityPoints: number;
  taskConversionRatio: number;
  specialistTaskPoints: number;
}

/** Capacity / ngày — shared across matching junior & executive tracks in the spreadsheet. */
const JUNIOR_CAPACITY_BY_LEVEL = [378, 423, 468, 513, 558, 603, 648, 655, 695, 734] as const;
const EXECUTIVE_CAPACITY_BY_LEVEL = [480, 531, 582, 633, 684, 735, 786, 837, 888, 937] as const;
const SENIOR_CAPACITY_BY_LEVEL = [706, 757, 808, 859, 909, 960, 1011, 1062, 1113, 1163] as const;
const PM_CAPACITY_BY_LEVEL = [791, 842, 893, 944, 994, 1045, 1096, 1147, 1198, 1248] as const;
const DM_CAPACITY_BY_LEVEL = [791, 841, 891, 941, 991, 1041, 1096, 1146, 1197, 1248] as const;

const buildCapacity = (
  dailyCapacityPoints: number,
  taskConversionRatio: number,
): CapacityFormulaValues => ({
  dailyCapacityPoints,
  taskConversionRatio,
  specialistTaskPoints: computeSpecialistTaskPoints(dailyCapacityPoints, taskConversionRatio),
});

const getSeniorExecutiveRatio = (family: 'spe' | 'sgd', level: number): number => {
  if (family === 'spe') return level <= 5 ? 80 : 75;
  return level <= 6 ? 80 : 75;
};

const getCapacityByLevel = (values: readonly number[], level: number): number =>
  values[Math.min(Math.max(level, 1), values.length) - 1];

export const getCapacityFormulaForCode = (code: string): CapacityFormulaValues => {
  const family = getJobTitleFamilyKey(code);
  const level = getJobTitleLevelNumber(code);

  switch (family) {
    case 'intern':
      return buildCapacity(198, 100);
    case 'jpe':
    case 'jgd':
      return buildCapacity(
        getCapacityByLevel(JUNIOR_CAPACITY_BY_LEVEL, level),
        100,
      );
    case 'pe':
    case 'gd':
      return buildCapacity(
        getCapacityByLevel(EXECUTIVE_CAPACITY_BY_LEVEL, level),
        100,
      );
    case 'spe':
      return buildCapacity(
        getCapacityByLevel(SENIOR_CAPACITY_BY_LEVEL, level),
        getSeniorExecutiveRatio('spe', level),
      );
    case 'sgd':
      return buildCapacity(
        getCapacityByLevel(SENIOR_CAPACITY_BY_LEVEL, level),
        getSeniorExecutiveRatio('sgd', level),
      );
    case 'pm':
      return buildCapacity(getCapacityByLevel(PM_CAPACITY_BY_LEVEL, level), 30);
    case 'dm':
      return buildCapacity(
        getCapacityByLevel(DM_CAPACITY_BY_LEVEL, level),
        level === 1 ? 75 : 50,
      );
    default:
      return buildCapacity(0, 100);
  }
};
