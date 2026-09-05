import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isSoldOut?: boolean;
}

export function ProgressBar({
  value,
  className,
  size = 'md',
  isSoldOut = false,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  let statusClass = '';
  if (isSoldOut || clampedValue >= 100) {
    statusClass = 'danger';
  } else if (clampedValue >= 75) {
    statusClass = 'warning';
  }

  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('progress-track', heightClass, className)}
      style={{ height: size === 'sm' ? '4px' : size === 'lg' ? '10px' : '6px' }}
    >
      <div
        className={cn('progress-bar-fill', statusClass)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
