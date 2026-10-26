import type { ReactNode } from 'react';

/** Red asterisk for required milestone fields. Unit never uses this. */
export function milestoneFieldLabel(text: string, required = false): ReactNode {
  if (!required) return text;
  return (
    <span>
      <span
        aria-hidden="true"
        style={{ color: '#ff4d4f', marginInlineEnd: 4, fontFamily: 'SimSun, sans-serif' }}
      >
        *
      </span>
      {text}
    </span>
  );
}
