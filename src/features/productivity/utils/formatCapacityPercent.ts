/** Format capacity % with up to 1 decimal (vi-VN). */
export function formatCapacityPercent(value: number): string {
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}
