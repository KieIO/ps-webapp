import api from '@/shared/api/base.api';
import {
  EmployeePerformanceDetailSchema,
  type EmployeePerformanceDetail,
} from './schemas/employeePerformance.schema';

export const employeePerformanceApi = {
  getDetail: async (
    userId: string,
    period: { year: number; month: number },
  ): Promise<EmployeePerformanceDetail> => {
    const response = await api.get(`/home/productivity/employees/${userId}`, {
      params: period,
    });
    return EmployeePerformanceDetailSchema.parse(response.data);
  },
};
