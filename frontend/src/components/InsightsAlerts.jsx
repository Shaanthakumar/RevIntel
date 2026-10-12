import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Zap, 
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function InsightsAlerts({ insightsData = {} }) {
  const insights = insightsData.insights || [];
  const anomalies = insightsData.anomalies || [];
  const strongestPeriod = insightsData.strongest_period;
  const weakestPeriod = insightsData.weakest_period;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900 border border-blue-500/30 rounded-xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              RevIntel Revenue Intelligence Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Automatically analyzes hotel booking trends, applies statistical rolling Z-score anomaly detection, and highlights critical revenue opportunities.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end text-xs">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg font-mono font-semibold">
            {insightsData.engine_type || 'Rule-Based Insight Engine'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Ready for future ML/LLM Agent integration
          </span>
        </div>
      </div>

      {/* Strongest & Weakest Revenue Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-emerald-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Strongest Revenue Period
              </h4>
              <p className="text-sm font-bold text-white font-mono">
                {strongestPeriod?.date || 'N/A'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Revenue</span>
              <strong className="text-emerald-400">${strongestPeriod?.revenue?.toLocaleString() || 0}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Occupancy</span>
              <strong className="text-white">{strongestPeriod?.occupancy_rate || 0}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ADR</span>
              <strong className="text-blue-400">${strongestPeriod?.adr || 0}</strong>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-rose-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Weakest Revenue Period
              </h4>
              <p className="text-sm font-bold text-white font-mono">
                {weakestPeriod?.date || 'N/A'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Revenue</span>
              <strong className="text-rose-400">${weakestPeriod?.revenue?.toLocaleString() || 0}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Occupancy</span>
              <strong className="text-white">{weakestPeriod?.occupancy_rate || 0}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ADR</span>
              <strong className="text-blue-400">${weakestPeriod?.adr || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Anomaly Detection Alerts Feed */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Statistical Anomalies Feed ({anomalies.length} Alerts)
          </h3>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
            Rolling Mean + Z-Score & IQR Detection
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.length > 0 ? (
            anomalies.map((anom) => (
              <div
                key={anom.id}
                className={`p-4 rounded-xl border text-xs flex items-start gap-3.5 transition-all ${
                  anom.severity === 'high'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  anom.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans']">
                      {anom.message}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 bg-slate-900/60 rounded">
                      {anom.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Metric: <strong className="text-slate-200">{anom.metric}</strong></span>
                    <span>Observed: <strong className="text-white">{anom.value}</strong></span>
                    <span>Baseline: <strong className="text-slate-300">{anom.baseline}</strong></span>
                    <span>Z-Score: <strong className="text-cyan-400">{anom.z_score}</strong></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No statistical anomalies detected in current timeline selection.
            </div>
          )}
        </div>
      </div>

      {/* Intelligent Data Insights Section */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Intelligent Data Insights
          </h3>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
            Rule-Based Insight Generator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans']">
                  {item.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono">
                  {item.category}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
