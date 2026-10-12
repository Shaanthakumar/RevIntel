import React from 'react';
import { 
  Bed, 
  DollarSign, 
  TrendingUp, 
  XCircle, 
  Calendar, 
  Clock, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot
} from 'recharts';

import KPICard from './KPICard';
import FilterBar from './FilterBar';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Dashboard({ 
  analyticsData = {}, 
  insightsData = {},
  filterOptions = {}, 
  filters, 
  onFilterChange, 
  onResetFilters 
}) {
  const kpis = analyticsData.kpis || {};
  const charts = analyticsData.charts || {};
  const timeline = charts.timeline || [];
  const segments = charts.segment_analysis || [];
  const rooms = charts.room_performance || [];
  const pace = charts.booking_pace || [];
  const anomalies = insightsData.anomalies || [];
  const insights = insightsData.insights || [];

  // Map anomaly dates for Recharts highlight overlays
  const anomalyDates = new Set(anomalies.map(a => a.date));

  return (
    <div className="space-y-6">
      {/* Dynamic Filter Bar */}
      <FilterBar
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Occupancy Rate"
          value={kpis.occupancy_rate?.value || 0}
          unit="%"
          prevValue={kpis.occupancy_rate?.prev_value || 0}
          changePct={kpis.occupancy_rate?.change_pct || 0}
          trend={kpis.occupancy_rate?.trend || 'up'}
          icon={Bed}
          accentColor="cyan"
        />

        <KPICard
          title="ADR (Average Daily Rate)"
          value={kpis.adr?.value || 0}
          unit="$"
          prevValue={kpis.adr?.prev_value || 0}
          changePct={kpis.adr?.change_pct || 0}
          trend={kpis.adr?.trend || 'up'}
          icon={DollarSign}
          accentColor="blue"
        />

        <KPICard
          title="RevPAR (Rev Per Room)"
          value={kpis.revpar?.value || 0}
          unit="$"
          prevValue={kpis.revpar?.prev_value || 0}
          changePct={kpis.revpar?.change_pct || 0}
          trend={kpis.revpar?.trend || 'up'}
          icon={TrendingUp}
          accentColor="emerald"
        />

        <KPICard
          title="Cancellation Rate"
          value={kpis.cancellation_rate?.value || 0}
          unit="%"
          prevValue={kpis.cancellation_rate?.prev_value || 0}
          changePct={kpis.cancellation_rate?.change_pct || 0}
          trend={kpis.cancellation_rate?.trend || 'down'}
          invertTrendColor={true}
          icon={XCircle}
          accentColor="amber"
        />

        <KPICard
          title="Total Bookings"
          value={kpis.total_bookings?.value || 0}
          unit=""
          prevValue={kpis.total_bookings?.prev_value || 0}
          changePct={kpis.total_bookings?.change_pct || 0}
          trend={kpis.total_bookings?.trend || 'up'}
          icon={Calendar}
          accentColor="purple"
        />

        <KPICard
          title="Average Lead Time"
          value={kpis.avg_lead_time?.value || 0}
          unit=" days"
          prevValue={kpis.avg_lead_time?.prev_value || 0}
          changePct={kpis.avg_lead_time?.change_pct || 0}
          trend="up"
          icon={Clock}
          accentColor="rose"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Occupancy Trend */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Bed className="w-4 h-4 text-cyan-400" />
              Occupancy Rate Trend (%)
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
              Daily Timeline ({timeline.length} Days)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} unit="%" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  formatter={(val) => [`${val}%`, 'Occupancy Rate']}
                />
                <Line type="monotone" dataKey="occupancy_rate" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. ADR & RevPAR Trend */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              ADR vs RevPAR Trend ($)
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
              Rate & Yield Comparison
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* 3. Booking & Cancellation Analysis */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Booking & Cancellation Volume
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
              Confirmed vs Canceled
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="confirmed" name="Confirmed" fill="#3b82f6" stackId="a" />
                <Bar dataKey="cancellations" name="Cancellations" fill="#f43f5e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Customer Segment Analysis */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              Customer Segment Contribution
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded font-mono">
              Revenue & Share %
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="revenue"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ segment, share_pct }) => `${segment} (${share_pct}%)`}
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Room Type Performance */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Room Type ADR ($) & Booking Volume
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rooms} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="room_type" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={10} unit="$" tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="adr" name="ADR ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="bookings" name="Bookings Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Booking Pace */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              Booking Pace (Lead Time Distribution)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pace} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="bookings" name="Bookings" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Revenue Intelligence Panel */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Revenue Intelligence • Intelligent Data Insights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated rule-based insights engine (Extensible interface for future AI/LLM models)
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg font-mono">
            RuleBasedEngine v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.length > 0 ? (
            insights.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-['Plus_Jakarta_Sans']">
                    {item.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-slate-500 text-xs">
              No specific insights generated for current selection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
