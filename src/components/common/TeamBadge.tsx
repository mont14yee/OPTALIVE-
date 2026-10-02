import React, { useState } from 'react';
import { Team } from '../../types/football';

interface TeamBadgeProps {
  team: Partial<Team> | { id: string; name: string; logoUrl?: string; shortName?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  namePosition?: 'bottom' | 'right';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-14 h-14 md:w-16 md:h-16',
  xl: 'w-16 h-16 md:w-20 md:h-20'
};

const DEFAULT_CREST = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  size = 'md',
  showName = false,
  namePosition = 'bottom',
  className = '',
  onClick
}) => {
  const [imgError, setImgError] = useState(false);
  const logo = (!imgError && team?.logoUrl) ? team.logoUrl : DEFAULT_CREST;
  const teamName = team?.shortName || team?.name || 'Club';

  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${
        namePosition === 'bottom' ? 'flex-col text-center' : 'flex-row gap-2.5'
      } ${isInteractive ? 'cursor-pointer group' : ''} ${className}`}
    >
      <img
        src={logo}
        alt={teamName}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} object-contain drop-shadow transition-transform duration-200 ${
          isInteractive ? 'group-hover:scale-105' : ''
        }`}
        loading="lazy"
      />
      {showName && (
        <span
          className={`font-display font-bold uppercase tracking-tight text-white ${
            size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'
          } ${isInteractive ? 'group-hover:text-[var(--primary-color)] transition-colors' : ''}`}
        >
          {teamName}
        </span>
      )}
    </div>
  );
};
