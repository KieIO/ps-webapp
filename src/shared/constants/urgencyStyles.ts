/** Display urgency colors — order is attention-first for sorting. */
export const URGENCY_KEYS = ['red', 'orange', 'yellow', 'cyan', 'purple', 'green', 'gray'] as const;

export type UrgencyKey = (typeof URGENCY_KEYS)[number];

export const URGENCY_SETTING_KEYS = ['auto', ...URGENCY_KEYS] as const;

export type UrgencySettingKey = (typeof URGENCY_SETTING_KEYS)[number];

export const URGENCY_STYLES: Record<UrgencyKey, { dot: string; border: string; label: string }> = {
  green: { dot: '#22C55E', border: '#22C55E', label: 'Low priority' },
  orange: { dot: '#F97316', border: '#F97316', label: 'Medium priority' },
  red: { dot: '#EF4444', border: '#EF4444', label: 'High priority' },
  purple: { dot: '#A855F7', border: '#A855F7', label: 'Freelancer' },
  yellow: { dot: '#EAB308', border: '#EAB308', label: 'Pending Feedback' },
  cyan: { dot: '#06B6D4', border: '#06B6D4', label: 'Pending brief' },
  // Off-white / very light grey — subtle border keeps the dot visible on light UI.
  gray: { dot: '#E5E7EB', border: '#D1D5DB', label: 'Finished' },
};

export const URGENCY_AUTO_STYLE = {
  dot: '#64748B',
  border: '#64748B',
  label: 'Auto (theo deadline)',
} as const;
