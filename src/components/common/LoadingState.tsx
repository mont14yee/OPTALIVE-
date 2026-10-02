import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Synchronizing verified match telemetry...',
  size = 'md',
  className = ''
}) => {
  const spinnerSizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-14 h-14 border-3'
  };

  return (
    <div className={`py-16 sm:py-24 text-center space-y-4 ${className}`}>
      <div
        className={`${spinnerSizes[size]} rounded-full border-[var(--primary-color)] border-t-transparent animate-spin mx-auto shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]`}
      />
      <p className="font-mono text-xs text-slate-400 uppercase tracking-widest animate-pulse max-w-sm mx-auto">
        {message}
      </p>
    </div>
  );
};
