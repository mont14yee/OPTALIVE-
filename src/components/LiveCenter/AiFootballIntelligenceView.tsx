import React, { useState, useEffect } from 'react';
import { 
  Fixture, 
  AiFootballIntelligence, 
  AiIntelligenceType 
} from '../../types/football';
import { footballClient } from '../../api/footballClient';

interface AiFootballIntelligenceViewProps {
  fixture: Fixture;
  initialType?: AiIntelligenceType;
}

export const AiFootballIntelligenceView: React.FC<AiFootballIntelligenceViewProps> = ({
  fixture,
  initialType = 'MATCH_INSIGHT'
}) => {
  const [selectedType, setSelectedType] = useState<AiIntelligenceType>(initialType);
  const [intelligence, setIntelligence] = useState<AiFootballIntelligence | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntelligence = (typeToFetch: AiIntelligenceType) => {
    setLoading(true);
    setError(null);

    footballClient
      .getFootballIntelligence(fixture.id, typeToFetch)
      .then((data) => {
        setIntelligence(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch AI intelligence:', err);
        setError('Unable to synthesize intelligence at this moment. Please retry.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIntelligence(selectedType);
  }, [fixture.id, selectedType]);

  const intelTypes: { id: AiIntelligenceType; label: string; icon: string; desc: string }[] = [
    {
      id: 'MATCH_INSIGHT',
      label: 'Match Insight',
      icon: 'fa-brain',
      desc: 'Tactical flow, zone dominance & spatial control'
    },
    {
      id: 'TEAM_FORM_ANALYSIS',
      label: 'Team Form Analysis',
      icon: 'fa-chart-line',
      desc: 'Head-to-head comparison, momentum & discipline'
    },
    {
      id: 'PLAYER_PERFORMANCE_SUMMARY',
      label: 'Player Performance',
      icon: 'fa-user-ninja',
      desc: 'Key player contributions & individual telemetry'
    },
    {
      id: 'POST_MATCH_SUMMARY',
      label: 'Post-Match Summary',
      icon: 'fa-flag-checkered',
      desc: 'Full-time debrief, turning points & performance audit'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Type Selector Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {intelTypes.map((t) => {
            const isActive = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap min-h-[40px] ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <i className={`fa-solid ${t.icon} text-[11px]`}></i>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => fetchIntelligence(selectedType)}
          disabled={loading}
          aria-label="Refresh intelligence analysis"
          className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
        >
          <i className={`fa-solid fa-arrows-rotate text-[11px] ${loading ? 'animate-spin' : ''}`}></i>
          <span>Re-Analyze</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-violet-500 border-t-transparent animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h4 className="font-display font-bold uppercase text-white text-sm tracking-wider">
              Reasoning Over Verified Match Facts
            </h4>
            <p className="font-mono text-xs text-slate-400 max-w-md mx-auto">
              Gemini is validating scores, xG metrics, lineups, and official events without assumptions.
            </p>
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
          <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
          <p className="font-mono text-xs text-red-300">{error}</p>
          <button
            onClick={() => fetchIntelligence(selectedType)}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Intelligence Body */}
      {intelligence && !loading && (
        <div className="space-y-6">
          {/* Executive Tactical Summary Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-slate-950 border border-violet-500/30 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-violet-300">
                  {intelligence.source === 'gemini' ? 'Gemini 3.8 Flash • Grounded Intelligence' : 'Grounded Rules Engine'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(intelligence.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-display font-bold text-white uppercase tracking-wide">
              {intelligence.matchTitle} — {selectedType.replace(/_/g, ' ')}
            </h3>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {intelligence.summary}
            </p>
          </div>

          {/* Three Categorized Pillars: Verified Provider Facts, Calculated Metrics, AI Interpretation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Verified Provider Facts */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Verified Provider Facts</span>
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  OFFICIAL
                </span>
              </div>

              <ul className="space-y-2">
                {intelligence.key_facts.map((fact, idx) => (
                  <li key={idx} className="text-xs font-mono text-slate-300 flex items-start gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <i className="fa-solid fa-check text-blue-400 text-[10px] mt-0.5 flex-shrink-0"></i>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Mathematically Calculated Metrics */}
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <i className="fa-solid fa-calculator"></i>
                  <span>Calculated Metrics</span>
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  DERIVED
                </span>
              </div>

              <div className="space-y-2">
                {intelligence.calculated_metrics.map((metric, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">{metric.label}</span>
                      <span className={`text-xs font-mono font-black ${
                        metric.trend === 'positive' ? 'text-emerald-400' : metric.trend === 'negative' ? 'text-red-400' : 'text-cyan-300'
                      }`}>
                        {metric.value}
                      </span>
                    </div>
                    {metric.note && (
                      <p className="text-[10px] font-mono text-slate-500">{metric.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. AI-Generated Interpretation */}
            <div className="p-4 sm:p-5 rounded-2xl bg-violet-950/20 border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                  <i className="fa-solid fa-brain"></i>
                  <span>AI Interpretation</span>
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  REASONING
                </span>
              </div>

              <ul className="space-y-2">
                {intelligence.performance_notes.map((note, idx) => (
                  <li key={idx} className="text-xs font-sans text-slate-300 flex items-start gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    <i className="fa-solid fa-lightbulb text-violet-400 text-[10px] mt-1 flex-shrink-0"></i>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Events Breakdown */}
          {intelligence.important_events && intelligence.important_events.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <i className="fa-solid fa-timeline text-[var(--primary-color)]"></i>
                <span>Match Events & Contextual Impact</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {intelligence.important_events.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white/10 text-xs font-mono font-bold text-[var(--primary-color)] flex items-center justify-center flex-shrink-0">
                      {ev.minute}'
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-display font-bold text-white truncate">{ev.description}</p>
                      <p className="text-[11px] font-mono text-slate-400">{ev.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Limitations Disclosure */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Explicit Data Limitations & Missing Feeds</span>
              </h4>
              <span className="text-[10px] font-mono text-amber-300">Strictly Audited</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              The AI model is explicitly prohibited from assuming missing information. The following data points are unavailable or unverified for this match:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {intelligence.data_limitations.map((lim, idx) => (
                <li key={idx} className="text-[11px] font-mono text-amber-200/80 flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-amber-500/10">
                  <i className="fa-solid fa-circle-info text-amber-400 text-[10px] mt-0.5 flex-shrink-0"></i>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mandatory Disclaimers */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
            <p className="text-[11px] font-mono text-slate-400">
              {intelligence.disclaimer}
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              Never present AI interpretation as official Opta editorial content. AI reasoning executes strictly server-side over normalized provider records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
