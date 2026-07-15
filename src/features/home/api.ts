import api from '@/shared/api/base.api';
import {
  EmployeeProductivitySchema,
  type EmployeeProductivity,
} from './schemas/employeeProductivity.schema';
import { OverallDashboardSchema, type OverallDashboard } from './schemas/overallDashboard.schema';

export const homeApi = {
  getEmployeeProductivity: async (): Promise<EmployeeProductivity> => {
    const response = await api.get('/home/employee/productivity');
    return EmployeeProductivitySchema.parse(response.data);
  },

  getOverallDashboard: async (period: {
    year: number;
    month: number;
  }): Promise<OverallDashboard> => {
    const response = await api.get('/home/overall', { params: period });
    return OverallDashboardSchema.parse(response.data);
  },
};
