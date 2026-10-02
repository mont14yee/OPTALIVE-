import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fa-satellite-dish',
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`py-14 sm:py-20 px-4 text-center rounded-3xl bg-slate-900/30 border border-white/5 space-y-3.5 max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xl mx-auto">
        <i className={`fa-solid ${icon}`} />
      </div>

      <div className="space-y-1">
        <h4 className="font-display font-bold uppercase text-sm sm:text-base text-slate-200">
          {title}
        </h4>
        {description && (
          <p className="font-mono text-xs text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
