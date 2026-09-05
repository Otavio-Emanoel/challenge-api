import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = 'indigo',
  className,
}: StatCardProps) {
  const accentStyles = {
    indigo: {
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
    emerald: {
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    amber: {
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    rose: {
      color: '#fb7185',
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(244, 63, 94, 0.2)',
    },
  }[variant];

  return (
    <div
      className={cn('card', className)}
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: accentStyles.bg,
            border: `1px solid ${accentStyles.border}`,
            color: accentStyles.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#fff',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
