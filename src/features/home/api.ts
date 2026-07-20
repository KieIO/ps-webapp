import api from '@/shared/api/base.api';
import {
  EmployeeProductivitySchema,
  type EmployeeProductivity,
} from './schemas/employeeProductivity.schema';
import { OverallDashboardSchema, type OverallDashboard } from './schemas/overallDashboard.schema';
import {
  CapacityBreakdownPageSchema,
  CapacityBreakdownStaffTasksSchema,
  type CapacityBreakdownPage,
  type CapacityBreakdownScope,
  type CapacityBreakdownStaffTasks,
} from './schemas/capacityBreakdown.schema';

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

  getCapacityBreakdown: async (params: {
    year: number;
    month: number;
    scope: CapacityBreakdownScope;
    page?: number;
    pageSize?: number;
  }): Promise<CapacityBreakdownPage> => {
    const response = await api.get('/home/overall/capacity-breakdown', { params });
    return CapacityBreakdownPageSchema.parse(response.data);
  },

  getCapacityBreakdownStaffTasks: async (params: {
    year: number;
    month: number;
    userId: string;
  }): Promise<CapacityBreakdownStaffTasks> => {
    const { userId, ...period } = params;
    const response = await api.get(`/home/overall/capacity-breakdown/staff/${userId}/tasks`, {
      params: period,
    });
    return CapacityBreakdownStaffTasksSchema.parse(response.data);
  },
};
