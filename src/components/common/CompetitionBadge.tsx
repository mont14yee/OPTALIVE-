import React, { useState } from 'react';
import { Competition } from '../../types/football';

interface CompetitionBadgeProps {
  competition: Partial<Competition> | { id: string; name: string; logoUrl?: string; shortName?: string };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

export const CompetitionBadge: React.FC<CompetitionBadgeProps> = ({
  competition,
  size = 'md',
  showName = true,
  className = '',
  onClick
}) => {
  const [imgError, setImgError] = useState(false);
  const logo = (!imgError && competition?.logoUrl) ? competition.logoUrl : null;
  const name = competition?.shortName || competition?.name || 'Tournament';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {logo ? (
        <img
          src={logo}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} object-contain flex-shrink-0`}
          loading="lazy"
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-md bg-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 flex-shrink-0`}>
          <i className="fa-solid fa-trophy text-[9px] text-[var(--primary-color)]" />
        </div>
      )}
      {showName && (
        <span className="font-display font-bold uppercase text-xs md:text-sm text-slate-200 group-hover:text-white transition-colors truncate">
          {name}
        </span>
      )}
    </div>
  );
};
