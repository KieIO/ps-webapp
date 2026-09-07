import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import { mockGetCapacityList } from './mock/capacity.mock';
import { mockGetCapacityMonthly } from './mock/capacityMonthly.mock';
import { mockGetRemainingOutput } from './mock/remainingOutput.mock';
import {
  CapacityListFiltersSchema,
  CapacityListResponseSchema,
  type CapacityListFilters,
  type CapacityListResponse,
} from './schemas/capacity.schema';
import {
  CapacityMonthlyFiltersSchema,
  CapacityMonthlyResponseSchema,
  type CapacityMonthlyFilters,
  type CapacityMonthlyResponse,
} from './schemas/capacityMonthly.schema';
import {
  RemainingOutputFiltersSchema,
  RemainingOutputResponseSchema,
  type RemainingOutputFilters,
  type RemainingOutputResponse,
} from './schemas/remainingOutput.schema';
import { buildCapacityMonthlyApiParams } from './utils/capacityMonthlyPeriod';
import { buildCapacityListApiParams } from './utils/capacityListPeriod';

export const capacityApi = {
  getList: async (filters: CapacityListFilters): Promise<CapacityListResponse> => {
    const parsed = CapacityListFiltersSchema.parse(filters);
    const params = buildCapacityListApiParams(parsed);

    if (env.useCapacityMock) {
      return CapacityListResponseSchema.parse(await mockGetCapacityList(parsed));
    }

    const response = await api.get('/capacity', { params });
    return CapacityListResponseSchema.parse(response.data);
  },

  getMonthly: async (filters: CapacityMonthlyFilters): Promise<CapacityMonthlyResponse> => {
    const parsed = CapacityMonthlyFiltersSchema.parse(filters);
    const params = buildCapacityMonthlyApiParams(parsed);

    if (env.useCapacityMock) {
      return CapacityMonthlyResponseSchema.parse(await mockGetCapacityMonthly(parsed));
    }

    const response = await api.get('/capacity/monthly', { params });
    return CapacityMonthlyResponseSchema.parse(response.data);
  },

  getRemainingOutput: async (filters: RemainingOutputFilters): Promise<RemainingOutputResponse> => {
    const parsed = RemainingOutputFiltersSchema.parse(filters);

    if (env.useCapacityMock) {
      return RemainingOutputResponseSchema.parse(await mockGetRemainingOutput(parsed));
    }

    const response = await api.get('/capacity/remaining-output', {
      params: {
        startDate: parsed.startDate,
        endDate: parsed.endDate,
      },
    });
    return RemainingOutputResponseSchema.parse(response.data);
  },
};
