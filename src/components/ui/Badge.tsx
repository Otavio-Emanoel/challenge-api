import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  const variantClass = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  }[variant];

  return (
    <span className={cn('badge', variantClass, className)} {...props}>
      {children}
    </span>
  );
}
