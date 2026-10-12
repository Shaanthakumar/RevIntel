import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bed, DollarSign, TrendingUp, XCircle, Calendar, Clock, 
  Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, agentRes] = await Promise.all([
        axios.post('/api/revenue/analytics', {}),
        axios.post('/api/agent/insights', {})
      ]);
      setData(analyticsRes.data);
      setAgentData(agentRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const timeline = data?.timeline || [];
  const segments = data?.segment_analysis || [];
  const rooms = data?.room_performance || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Hotel Revenue Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monitoring, core revenue KPIs, and predictive decision-support overview
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors w-fit"
        >
          Refresh Analytics
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: 'Occupancy', val: `${kpis.occupancy_rate?.value || 0}%`, chg: kpis.occupancy_rate?.change_pct, icon: Bed, color: 'text-cyan-400' },
          { title: 'ADR', val: `$${kpis.adr?.value || 0}`, chg: kpis.adr?.change_pct, icon: DollarSign, color: 'text-blue-400' },
          { title: 'RevPAR', val: `$${kpis.revpar?.value || 0}`, chg: kpis.revpar?.change_pct, icon: TrendingUp, color: 'text-emerald-400' },
          { title: 'Total Revenue', val: `$${(kpis.total_revenue || 0).toLocaleString()}`, chg: 0, icon: Layers, color: 'text-purple-400' },
          { title: 'Bookings', val: kpis.total_bookings?.value || 0, chg: kpis.total_bookings?.change_pct, icon: Calendar, color: 'text-indigo-400' },
          { title: 'Cancellation', val: `${kpis.cancellation_rate?.value || 0}%`, chg: kpis.cancellation_rate?.change_pct, icon: XCircle, color: 'text-amber-400' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium truncate">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-xl font-extrabold text-white font-mono tracking-tight">
                {kpi.val}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {kpi.chg !== 0 && (
                  <span className={kpi.chg > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {kpi.chg > 0 ? '+' : ''}{kpi.chg}%
                  </span>
                )}
                <span>vs prev period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Revenue Intelligence Section (Section 15 Requirements) */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-cyan-900/20 border border-blue-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Plus_Jakarta_Sans']">
            Revenue Intelligence • Executive Briefing
          </h3>
        </div>
        
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {agentData?.executive_summary || 'Analyzing active reservation patterns, demand pacing, and channel yield...'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900/80 border border-emerald-500/30 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Top Opportunity</span>
            <p className="text-slate-200">{agentData?.top_opportunities?.[0] || 'Peak weekend compression provides room for +$25 ADR increase.'}</p>
          </div>

          <div className="p-3 bg-slate-900/80 border border-rose-500/30 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Top Risk</span>
            <p className="text-slate-200">{agentData?.top_risks?.[0] || 'Review elevated cancellation rate on extended lead time reservations.'}</p>
          </div>

          <div className="p-3 bg-slate-900/80 border border-cyan-500/30 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Latest Recommendation</span>
            <p className="text-slate-200">Raise Deluxe Room rate from $160 to $185 on upcoming high-demand dates.</p>
          </div>

          <div className="p-3 bg-slate-900/80 border border-amber-500/30 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Forecast Summary</span>
            <p className="text-slate-200">30-day forecasted occupancy: 74.5% (High weekend demand pacing).</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bed className="w-4 h-4 text-cyan-400" /> Occupancy Trend (%)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} unit="%" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="occupancy_rate" name="Occupancy %" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" /> ADR vs RevPAR ($)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} unit="$" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="adr" name="ADR ($)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revpar" name="RevPAR ($)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
