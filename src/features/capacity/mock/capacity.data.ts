import type { EmployeeCapacity } from '../schemas/capacity.schema';
import { computeSpecialistTaskPoints } from '@/features/titles/utils/capacityFormula';
import { MOCK_DAILY_CAPACITY_BY_LEVEL, type JobLevel } from '../constants';

type CapacitySeed = Omit<
  EmployeeCapacity,
  | 'dailyCapacityPoints'
  | 'positionCode'
  | 'jobTitleName'
  | 'specialistTaskPoints'
  | 'achievedTaskPoints'
>;

const TITLE_BY_LEVEL: Record<JobLevel, { positionCode: string; jobTitleName: string }> = {
  manager: { positionCode: 'MGR-1', jobTitleName: 'Manager Level 1' },
  senior: { positionCode: 'SR-1', jobTitleName: 'Senior Level 1' },
  executive: { positionCode: 'EXE-1', jobTitleName: 'Executive Level 1' },
  junior: { positionCode: 'JR-1', jobTitleName: 'Junior Level 1' },
};

const RATIO_BY_LEVEL: Record<JobLevel, number> = {
  manager: 75,
  senior: 80,
  executive: 100,
  junior: 100,
};

const SEED_ITEMS: CapacitySeed[] = [
  {
    id: 'cap-001',
    name: 'Võ Hoàn Thông',
    department: 'creative_hcm',
    jobLevel: 'manager',
    workStatus: 'working',
    capacityPercent: 72,
  },
  {
    id: 'cap-002',
    name: 'Lữ Tuấn Linh',
    department: 'project',
    jobLevel: 'senior',
    workStatus: 'working',
    capacityPercent: 88,
  },
  {
    id: 'cap-003',
    name: 'Lâm Ngọc Kim Ngân',
    department: 'project',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 95,
  },
  {
    id: 'cap-004',
    name: 'Phạm Hoàng Quyên',
    department: 'project',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 64,
  },
  {
    id: 'cap-005',
    name: 'Lê Huỳnh Lệ Chi',
    department: 'creative_ag',
    jobLevel: 'senior',
    workStatus: 'working',
    capacityPercent: 91,
  },
  {
    id: 'cap-006',
    name: 'Trương Phú Tuấn',
    department: 'project',
    jobLevel: 'senior',
    workStatus: 'working',
    capacityPercent: 78,
  },
  {
    id: 'cap-007',
    name: 'Nguyễn Đỗ Bích Thùy',
    department: 'creative_hcm',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 83,
  },
  {
    id: 'cap-008',
    name: 'Nguyễn Ngọc Vân Anh',
    department: 'creative_hcm',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 56,
  },
  {
    id: 'cap-009',
    name: 'Võ Đặng Phương Anh',
    department: 'creative_hcm',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 102,
  },
  {
    id: 'cap-010',
    name: 'Trần Hà Gia Lộc',
    department: 'project',
    jobLevel: 'executive',
    workStatus: 'working',
    capacityPercent: 69,
  },
  {
    id: 'cap-011',
    name: 'Phạm Trung Chiến',
    department: 'project',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 45,
  },
  {
    id: 'cap-012',
    name: 'Lê Tấn Đạt',
    department: 'project',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 58,
  },
  {
    id: 'cap-013',
    name: 'Nguyễn Thị Huyền Trâm',
    department: 'project',
    jobLevel: 'junior',
    workStatus: 'off',
    capacityPercent: null,
  },
  {
    id: 'cap-014',
    name: 'Phan Nguyễn Như Quỳnh',
    department: 'project',
    jobLevel: 'junior',
    workStatus: 'off',
    capacityPercent: null,
  },
  {
    id: 'cap-015',
    name: 'Phan Hoàng Phương Khanh',
    department: 'project',
    jobLevel: 'junior',
    workStatus: 'off',
    capacityPercent: null,
  },
  {
    id: 'cap-016',
    name: 'Mai Hoàng Yến',
    department: 'creative_hcm',
    jobLevel: 'senior',
    workStatus: 'working',
    capacityPercent: 86,
  },
  {
    id: 'cap-017',
    name: 'Hoàng Thanh Vinh',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 74,
  },
  {
    id: 'cap-018',
    name: 'Mai Nguyên Quý Ngọc',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 52,
  },
  {
    id: 'cap-019',
    name: 'Phó Khánh Nhi',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 61,
  },
  {
    id: 'cap-020',
    name: 'Phùng Huy Hoàng',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 48,
  },
  {
    id: 'cap-021',
    name: 'Nguyễn Đỗ Thùy Trang',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 67,
  },
  {
    id: 'cap-022',
    name: 'Trương Nhựt Long',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 55,
  },
  {
    id: 'cap-023',
    name: 'Nguyễn Thị Phương Ngân',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 79,
  },
  {
    id: 'cap-024',
    name: 'Trần Minh Vy',
    department: 'creative_hcm',
    jobLevel: 'junior',
    workStatus: 'working',
    capacityPercent: 93,
  },
];

/** Dev seed — employee capacity snapshot for today. */
export const INITIAL_MOCK_CAPACITY: EmployeeCapacity[] = SEED_ITEMS.map((item) => {
  const dailyCapacityPoints = MOCK_DAILY_CAPACITY_BY_LEVEL[item.jobLevel];
  const achievedTaskPoints =
    item.workStatus === 'working' && item.capacityPercent !== null
      ? Math.round((item.capacityPercent * dailyCapacityPoints) / 100)
      : 0;

  return {
    ...item,
    ...TITLE_BY_LEVEL[item.jobLevel],
    dailyCapacityPoints,
    specialistTaskPoints: computeSpecialistTaskPoints(
      dailyCapacityPoints,
      RATIO_BY_LEVEL[item.jobLevel],
    ),
    achievedTaskPoints,
  };
});
