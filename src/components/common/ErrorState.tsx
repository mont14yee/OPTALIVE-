import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Feed Connection Error',
  message = 'Unable to synchronize telemetry with the provider. Cached verified statistics remain available.',
  onRetry,
  className = ''
}) => {
  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mx-auto shadow-inner">
        <i className="fa-solid fa-triangle-exclamation" />
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold uppercase text-base sm:text-lg text-white">
          {title}
        </h3>
        <p className="text-xs font-mono text-rose-200/80 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-rose-400 transition-colors shadow-lg shadow-rose-950/50 cursor-pointer"
        >
          <i className="fa-solid fa-arrows-rotate text-[11px]" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
