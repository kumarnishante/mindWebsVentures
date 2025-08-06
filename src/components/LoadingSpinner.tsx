import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      aria-label="Loading..."
      role="status"
    />
  );
};
