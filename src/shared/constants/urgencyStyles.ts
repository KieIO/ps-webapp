export const URGENCY_KEYS = ['red', 'orange', 'green', 'gray'] as const;

export type UrgencyKey = (typeof URGENCY_KEYS)[number];

export const URGENCY_SETTING_KEYS = ['auto', ...URGENCY_KEYS] as const;

export type UrgencySettingKey = (typeof URGENCY_SETTING_KEYS)[number];

export const URGENCY_STYLES: Record<UrgencyKey, { dot: string; border: string; label: string }> = {
  red: { dot: '#DC2626', border: '#DC2626', label: 'Gấp' },
  orange: { dot: '#EA580C', border: '#EA580C', label: 'Gấp vừa' },
  green: { dot: '#16A34A', border: '#16A34A', label: 'Bình thường' },
  gray: { dot: '#6366F1', border: '#6366F1', label: 'Hoàn tất' },
};

export const URGENCY_AUTO_STYLE = {
  dot: '#64748B',
  border: '#64748B',
  label: 'Auto (theo deadline)',
} as const;
