import api from '@/shared/api/base.api';
import {
  EmployeeProductivitySchema,
  type EmployeeProductivity,
} from './schemas/employeeProductivity.schema';

export const homeApi = {
  getEmployeeProductivity: async (): Promise<EmployeeProductivity> => {
    const response = await api.get('/home/employee/productivity');
    return EmployeeProductivitySchema.parse(response.data);
  },
};
