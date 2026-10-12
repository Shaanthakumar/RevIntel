import React from 'react';
import { TrendingUp, Layers, Share2, Clock, DollarSign, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Analysis({ analyticsData = {} }) {
  const charts = analyticsData.charts || {};
  const rooms = charts.room_performance || [];
  const channels = charts.channel_performance || [];
  const pace = charts.booking_pace || [];

  return (
    <div className="space-y-6">
      {/* 1. Room Type Performance Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Room Type Performance Matrix
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Room Type</th>
                <th className="p-3 text-right">Bookings Count</th>
                <th className="p-3 text-right">ADR ($)</th>
                <th className="p-3 text-right">Total Revenue ($)</th>
                <th className="p-3 text-right">Cancellation Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rooms.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-sans font-semibold text-white">{r.room_type}</td>
                  <td className="p-3 text-right">{r.bookings}</td>
                  <td className="p-3 text-right text-blue-400 font-bold">${r.adr}</td>
                  <td className="p-3 text-right text-emerald-400 font-bold">${r.revenue?.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      r.cancellation_rate > 25 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {r.cancellation_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Distribution Channel Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            Distribution Channel Yield
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Channel</th>
                  <th className="p-3 text-right">Bookings</th>
                  <th className="p-3 text-right">Revenue ($)</th>
                  <th className="p-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {channels.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans font-semibold text-white">{c.channel}</td>
                    <td className="p-3 text-right">{c.bookings}</td>
                    <td className="p-3 text-right text-emerald-400">${c.revenue?.toLocaleString()}</td>
                    <td className="p-3 text-right text-blue-400 font-bold">{c.share_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Lead Time & Pace Breakdown
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Lead Window</th>
                  <th className="p-3 text-right">Bookings</th>
                  <th className="p-3 text-right">Cancellation Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {pace.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans font-semibold text-white">{p.bucket}</td>
                    <td className="p-3 text-right">{p.bookings}</td>
                    <td className="p-3 text-right text-rose-400">{p.cancellation_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
