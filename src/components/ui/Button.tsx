import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    }[variant];

    const sizeClass = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('btn', variantClass, sizeClass, className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
