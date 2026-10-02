import React, { useState, useEffect } from 'react';
import { ApiStatus } from '../types/football';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatus | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiStatus
}) => {
  const [activeTheme, setActiveTheme] = useState<string>('green');
  const [refreshInterval, setRefreshInterval] = useState<number>(25);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const themeOptions = [
    { id: 'green', name: 'Opta Neon Green', hex: '#39ff14', rgb: '57, 255, 20' },
    { id: 'cyan', name: 'Electric Cyan', hex: '#00e5ff', rgb: '0, 229, 255' },
    { id: 'gold', name: 'Championship Gold', hex: '#ffb703', rgb: '255, 183, 3' },
    { id: 'rose', name: 'Cyber Crimson', hex: '#ff0055', rgb: '255, 0, 85' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeId') || 'green';
    const savedInterval = localStorage.getItem('refreshInterval');
    const savedSound = localStorage.getItem('soundAlerts');
    const savedContrast = localStorage.getItem('highContrast');

    setActiveTheme(savedTheme);
    if (savedInterval) setRefreshInterval(Number(savedInterval));
    if (savedSound) setSoundAlerts(savedSound === 'true');
    if (savedContrast) setHighContrast(savedContrast === 'true');
  }, []);

  const changeTheme = (theme: typeof themeOptions[0]) => {
    setActiveTheme(theme.id);
    document.documentElement.style.setProperty('--primary-color', theme.hex);
    document.documentElement.style.setProperty('--primary-rgb', theme.rgb);
    localStorage.setItem('themeId', theme.id);
    localStorage.setItem('themeColor', theme.hex);
    localStorage.setItem('themeRgb', theme.rgb);
  };

  const handleIntervalChange = (val: number) => {
    setRefreshInterval(val);
    localStorage.setItem('refreshInterval', String(val));
  };

  const handleSoundToggle = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    localStorage.setItem('soundAlerts', String(next));
  };

  const handleContrastToggle = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('highContrast', String(next));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-slate-950 border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/30 flex items-center justify-center text-[var(--primary-color)]">
              <i className="fa-solid fa-sliders text-sm"></i>
            </div>
            <div>
              <h3 className="font-display font-bold uppercase text-base text-white">Application Settings</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Telemetry preferences & visual configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Settings Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Neon Accent Theme */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i className="fa-solid fa-palette text-[var(--primary-color)]"></i> Neon Accent System
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {themeOptions.map((t) => {
                const isSelected = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'bg-white/10 border-white text-white font-bold'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: t.hex }}
                    ></span>
                    <span className="text-xs font-mono truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Polling Rate */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i className="fa-solid fa-rotate text-blue-400"></i> Live Telemetry Refresh Interval
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleIntervalChange(sec)}
                  className={`p-2.5 rounded-xl border font-mono text-xs text-center transition-all cursor-pointer min-h-[44px] ${
                    refreshInterval === sec
                      ? 'bg-[var(--primary-color)] text-black font-bold border-transparent'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {sec} seconds
                </button>
              ))}
            </div>
          </div>

          {/* Notification & Display Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Preferences & Accessibility
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs font-display font-bold text-white">Goal & Match Event Alerts</p>
                  <p className="text-[10px] font-mono text-slate-400">Audio feedback during key live incidents</p>
                </div>
                <button
                  onClick={handleSoundToggle}
                  aria-pressed={soundAlerts}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundAlerts ? 'bg-[var(--primary-color)]' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                      soundAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs font-display font-bold text-white">High Contrast Text Mode</p>
                  <p className="text-[10px] font-mono text-slate-400">Maximized label contrast for outdoor daylight viewing</p>
                </div>
                <button
                  onClick={handleContrastToggle}
                  aria-pressed={highContrast}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    highContrast ? 'bg-[var(--primary-color)]' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>

          {/* Engine Status Diagnostic Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">Data Source Engine:</span>
              <span className="font-bold text-[var(--primary-color)]">
                {apiStatus?.dataSource || 'Opta Verified Engine'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">Sportmonks v3 API:</span>
              <span className={apiStatus?.sportmonksConfigured ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {apiStatus?.sportmonksConfigured ? 'Connected' : 'Fallback Reference'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">Telemetry Core:</span>
              <span className="text-white font-bold">OPTA Precision v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
