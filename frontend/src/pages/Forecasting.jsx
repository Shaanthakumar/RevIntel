import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart as ChartIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Forecasting() {
  const [forecasts, setForecasts] = useState([]);
  const [modelSummary, setModelSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/forecasts?horizon_days=30');
      setForecasts(res.data.items);
      setModelSummary(res.data.model_summary);
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
            Demand & Occupancy Forecasting
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            30-day proactive unconstrained demand projection with 95% confidence intervals
          </p>
        </div>
        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-cyan-400 rounded-lg text-xs font-mono">
          Phase 5 ML Interface
        </span>
      </div>

      {/* Model Benchmark Card */}
      <div className="p-4 bg-[#1e293b] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Forecasting Model Baseline</span>
          <strong className="text-white text-sm">Seasonal Exponential Smoothing v1.0</strong>
        </div>
        <div className="flex items-center gap-6 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">MAE</span>
            <strong className="text-emerald-400">4.2%</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">RMSE</span>
            <strong className="text-cyan-400">5.8%</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Confidence</span>
            <strong className="text-white">95%</strong>
          </div>
        </div>
      </div>

      {/* Forecast Line Chart */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-cyan-400" /> 30-Day Forward Projected Occupancy Rate (%)
        </h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecasts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="target_date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[50, 100]} unit="%" tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="forecasted_value" name="Forecast Occupancy %" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="upper_bound" name="Upper 95% Bound" stroke="#10b981" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="lower_bound" name="Lower 95% Bound" stroke="#f43f5e" strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
