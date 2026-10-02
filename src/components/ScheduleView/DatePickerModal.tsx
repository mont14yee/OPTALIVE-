import React, { useState } from 'react';
import { parseDateOnlyParts, isDateOnly, getLocalTodayIsoDate } from '../../utils/footballDates';

interface DatePickerModalProps {
  currentDateIso: string; // YYYY-MM-DD or preset like 'today'
  onSelectDate: (isoDate: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  currentDateIso,
  onSelectDate,
  onClose
}) => {
  const todayIso = getLocalTodayIsoDate();
  const initialBase = isDateOnly(currentDateIso) ? currentDateIso : todayIso;
  const initialParts = parseDateOnlyParts(initialBase);

  const [viewYear, setViewYear] = useState<number>(initialParts.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParts.month); // 1-12
  const [selectedDayIso, setSelectedDayIso] = useState<string>(initialBase);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 is Sunday

  const days: { day: number; iso: string; isCurrentMonth: boolean }[] = [];

  // Blank slots for previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: 0, iso: '', isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(viewMonth).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({
      day: d,
      iso: `${viewYear}-${mStr}-${dStr}`,
      isCurrentMonth: true
    });
  }

  const handleApply = (iso: string) => {
    onSelectDate(iso);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-950 border border-white/15 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/30 flex items-center justify-center text-[var(--primary-color)]">
              <i className="fa-regular fa-calendar-days text-sm"></i>
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
                Select Match Date
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Browse fixtures on any calendar day
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleApply(todayIso)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[var(--primary-color)]/20 hover:text-[var(--primary-color)] border border-white/10 font-mono text-[10px] font-semibold text-slate-300 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              const tmrw = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
              handleApply(tmrw);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[var(--primary-color)]/20 hover:text-[var(--primary-color)] border border-white/10 font-mono text-[10px] font-semibold text-slate-300 transition-colors"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => {
              const nextSat = new Date(Date.now() + (6 - new Date().getDay() + 7) % 7 * 86400000 || 86400000).toISOString().slice(0, 10);
              handleApply(nextSat);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[var(--primary-color)]/20 hover:text-[var(--primary-color)] border border-white/10 font-mono text-[10px] font-semibold text-slate-300 transition-colors"
          >
            Weekend
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <div className="font-display font-bold text-sm text-white tracking-wider">
            {monthNames[viewMonth - 1]} {viewYear}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {/* Day of week labels */}
          <div className="grid grid-cols-7 text-center font-mono text-[10px] text-slate-500 font-bold">
            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days numbers */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return <div key={`empty-${idx}`} className="h-8"></div>;
              }

              const isSelected = item.iso === selectedDayIso;
              const isToday = item.iso === todayIso;

              return (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => setSelectedDayIso(item.iso)}
                  className={`h-8 rounded-lg font-mono text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[var(--primary-color)] text-black font-black shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)] scale-105'
                      : isToday
                      ? 'bg-white/15 text-white font-bold border border-[var(--primary-color)]/60'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.day}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[var(--primary-color)] absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleApply(selectedDayIso)}
            className="flex-1 py-2 rounded-xl bg-[var(--primary-color)] hover:brightness-110 text-black font-display font-black uppercase text-xs tracking-wider transition-all"
          >
            View Matches
          </button>
        </div>
      </div>
    </div>
  );
};
