// src/presentation/components/ui/Badge.tsx

import { type ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'default' | 'secondary';
  children: ReactNode;
}

const styles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
  success: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    border: '1px solid #BBF7D0',
  },
  warning: {
    backgroundColor: '#FEF9C3',
    color: '#854D0E',
    border: '1px solid #FDE68A',
  },
  default: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
  },
  secondary: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    border: '1px solid #BFDBFE',
  },
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.625rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}
