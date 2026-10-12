import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Share2, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function RevenueAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/revenue/analytics', {});
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rooms = data?.room_performance || [];
  const channels = data?.channel_performance || [];
  const pace = data?.booking_pace || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Revenue & Channel Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          In-depth yield analysis across room categories, distribution channels, and booking pace
        </p>
      </div>

      {/* Room Performance Matrix */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> Room Type Performance Breakdown
        </h3>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Room Type</th>
                <th className="p-3 text-right">Bookings</th>
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
                    <span className={`px-2 py-0.5 rounded text-[10px] ${r.cancellation_rate > 25 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                      {r.cancellation_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channels & Pace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" /> Channel Revenue Contribution
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

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" /> Booking Pace by Lead Window
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pace}>
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
    </div>
  );
}
