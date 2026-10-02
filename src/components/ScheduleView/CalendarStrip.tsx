import React from 'react';
import { generateCalendarStrip, getRelativeDayLabel, formatCalendarDateOnly, isDateOnly } from '../../utils/footballDates';

interface CalendarStripProps {
  selectedDate: string; // 'today', 'tomorrow', 'this_week', 'next_week', or 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  onOpenDatePicker: () => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  onOpenDatePicker
}) => {
  // If selectedDate is a preset like 'today', generate strip relative to today
  const effectiveIso = isDateOnly(selectedDate)
    ? selectedDate
    : new Date().toISOString().slice(0, 10);

  const days = generateCalendarStrip(effectiveIso, 7);

  // Navigate 1 day back or forward
  const shiftDay = (direction: -1 | 1) => {
    const curParts = effectiveIso.split('-').map(Number);
    const d = new Date(curParts[0], curParts[1] - 1, curParts[2]);
    d.setDate(d.getDate() + direction);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  };

  const getActiveTitle = () => {
    if (selectedDate === 'today') return 'Today\'s Matches';
    if (selectedDate === 'tomorrow') return 'Tomorrow\'s Matches';
    if (selectedDate === 'this_week') return 'This Week\'s Fixtures';
    if (selectedDate === 'next_week') return 'Next Week\'s Fixtures';
    if (isDateOnly(selectedDate)) {
      const rel = getRelativeDayLabel(selectedDate);
      if (rel) return `${rel} • ${formatCalendarDateOnly(selectedDate, { includeYear: true })}`;
      return formatCalendarDateOnly(selectedDate, { includeYear: true });
    }
    return 'Football Schedule';
  };

  return (
    <div className="bg-slate-900/40 p-2.5 sm:p-3.5 rounded-2xl border border-white/5 space-y-2.5">
      {/* Top row: Current Date label + Navigation Arrows + Date Picker Button */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            title="Previous Day"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>

          <button
            type="button"
            onClick={onOpenDatePicker}
            title="Click to open full calendar"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer group"
          >
            <i className="fa-regular fa-calendar text-[var(--primary-color)] text-xs"></i>
            <span className="font-bold tracking-wide group-hover:text-[var(--primary-color)] transition-colors">
              {getActiveTitle()}
            </span>
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-500 group-hover:text-white transition-colors"></i>
          </button>

          <button
            type="button"
            onClick={() => shiftDay(1)}
            title="Next Day"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        {/* Shortcut to Jump to Today */}
        <button
          type="button"
          onClick={() => onSelectDate('today')}
          className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
            selectedDate === 'today'
              ? 'bg-[var(--primary-color)] text-black shadow-md'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          Jump Today
        </button>
      </div>

      {/* Mini 7-Day Day Selector Strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1 border-t border-white/5">
        {days.map((item) => {
          const isActive = selectedDate === item.isoDate || (selectedDate === 'today' && item.isToday);
          return (
            <button
              key={item.isoDate}
              type="button"
              onClick={() => onSelectDate(item.isoDate)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-[var(--primary-color)] text-black font-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)] scale-102'
                  : item.isToday
                  ? 'bg-white/10 text-white font-bold border border-[var(--primary-color)]/40 hover:bg-white/15'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isActive ? 'text-black/80 font-bold' : 'text-slate-400'}`}>
                {item.dayOfWeek}
              </span>
              <span className="text-sm sm:text-base font-display font-black leading-tight mt-0.5">
                {item.dayNumber}
              </span>
              <span className={`text-[9px] font-mono leading-none ${isActive ? 'text-black/70' : 'text-slate-500'}`}>
                {item.monthShort}
              </span>

              {item.isToday && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] absolute top-1 right-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
