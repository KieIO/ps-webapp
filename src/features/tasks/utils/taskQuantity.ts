export const WHOLE_TASK_QUANTITY_MESSAGE = 'Số lượng phải là số nguyên lớn hơn 0';

/** Task quantity counts whole units (slides, parts). Decimals are not a valid amount. */
export const isPositiveWholeQuantity = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1;

export const wholeTaskQuantityRule = {
  validator: async (_: unknown, value: unknown) => {
    if (value == null || value === '') return;
    if (!isPositiveWholeQuantity(value)) {
      throw new Error(WHOLE_TASK_QUANTITY_MESSAGE);
    }
  },
};
