import api from '@/shared/api/base.api';
import {
  ProductivityDashboardSchema,
  ProductivityRankingSchema,
  type ProductivityDashboard,
  type ProductivityRanking,
} from './schemas/productivityDashboard.schema';
import { TeamProductivitySchema, type TeamProductivity } from './schemas/teamProductivity.schema';

export type RankingDepartment = 'all' | 'project' | 'creative';

export const productivityApi = {
  getDashboard: async (period: { year: number; month: number }): Promise<ProductivityDashboard> => {
    const response = await api.get('/home/productivity', { params: period });
    return ProductivityDashboardSchema.parse(response.data);
  },

  getRanking: async (
    period: { year: number; month: number },
    department: RankingDepartment = 'all',
  ): Promise<ProductivityRanking> => {
    const response = await api.get('/home/productivity/ranking', {
      params: {
        ...period,
        ...(department !== 'all' ? { department } : {}),
      },
    });
    return ProductivityRankingSchema.parse(response.data);
  },

  getTeamDashboard: async (period: { year: number; month: number }): Promise<TeamProductivity> => {
    const response = await api.get('/home/productivity/team', { params: period });
    return TeamProductivitySchema.parse(response.data);
  },
};
