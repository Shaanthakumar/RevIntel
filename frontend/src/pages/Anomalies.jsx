import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/anomalies', {});
      setAnomalies(res.data.anomalies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Statistical Anomaly Detection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated monitoring of spikes and drops across booking velocity, ADR, occupancy, and cancellations
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Detected: <strong className="text-amber-400">{anomalies.length} Anomaly Events</strong>
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            className={`p-4 rounded-xl border text-xs flex items-start gap-3.5 transition-all ${
              anom.severity === 'high'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${anom.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
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

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                <span>Metric: <strong className="text-slate-200">{anom.metric}</strong></span>
                <span>Observed: <strong className="text-white">{anom.value}</strong></span>
                <span>Expected Baseline: <strong className="text-slate-300">{anom.baseline}</strong></span>
                <span>Z-Score: <strong className="text-cyan-400">{anom.z_score}</strong></span>
                <span>Severity: <strong className="uppercase text-amber-400">{anom.severity}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
