import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Globe, PieChart as PieIcon, Award } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CustomerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  const segments = data?.segment_analysis || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Customer & Segment Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Behavioral profiling, customer segmentation yield, and guest concentration metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Share Chart */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" /> Customer Segment Revenue Contribution
          </h3>
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
                  {segments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Matrix */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Segment Yield Performance
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Segment</th>
                  <th className="p-3 text-right">Bookings</th>
                  <th className="p-3 text-right">ADR ($)</th>
                  <th className="p-3 text-right">Total Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {segments.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans font-semibold text-white">{s.segment}</td>
                    <td className="p-3 text-right">{s.bookings}</td>
                    <td className="p-3 text-right text-blue-400 font-bold">${s.adr}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${Number(s.revenue).toLocaleString()}</td>
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
