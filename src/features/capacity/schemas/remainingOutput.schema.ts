import { z } from 'zod';

export const RemainingOutputDaySchema = z.object({
  date: z.string(),
  isWeekend: z.boolean(),
  projectRemainingSlides: z.number().int(),
  creativeRemainingDA: z.number().int(),
});

export const RemainingOutputAssumptionSchema = z.object({
  slidesTaskLevel: z.number().int(),
  slidesPointsPerUnit: z.number().int(),
  daTaskLevel: z.number().int(),
  daPointsPerUnit: z.number().int(),
  note: z.string(),
});

export const RemainingOutputResponseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  assumption: RemainingOutputAssumptionSchema,
  days: z.array(RemainingOutputDaySchema),
});

export const RemainingOutputFiltersSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type RemainingOutputDay = z.infer<typeof RemainingOutputDaySchema>;
export type RemainingOutputAssumption = z.infer<typeof RemainingOutputAssumptionSchema>;
export type RemainingOutputResponse = z.infer<typeof RemainingOutputResponseSchema>;
export type RemainingOutputFilters = z.infer<typeof RemainingOutputFiltersSchema>;
