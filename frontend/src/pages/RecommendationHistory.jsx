import React, { useState } from 'react';
import { History, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function RecommendationHistory() {
  const [history] = useState([
    {
      id: 'REC-PRC-101',
      date: '2026-10-09',
      room_type: 'Deluxe',
      type: 'Dynamic Pricing',
      current_val: '$160',
      rec_val: '$185',
      status: 'Accepted',
      user: 'revenue_manager',
      timestamp: '2026-10-09 14:22:10'
    },
    {
      id: 'REC-INV-201',
      date: '2026-10-08',
      room_type: 'Standard',
      type: 'Inventory Allocation',
      current_val: '50% Direct',
      rec_val: '70% Direct',
      status: 'Accepted',
      user: 'revenue_manager',
      timestamp: '2026-10-08 10:15:45'
    },
    {
      id: 'REC-PRC-098',
      date: '2026-10-06',
      room_type: 'Suite',
      type: 'Dynamic Pricing',
      current_val: '$380',
      rec_val: '$420',
      status: 'Rejected',
      user: 'revenue_manager',
      timestamp: '2026-10-06 16:40:02'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Recommendation Audit & Decision History
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditable log of all pricing and inventory allocation actions taken by revenue managers
        </p>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Target Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Room Type</th>
                <th className="p-3">Current</th>
                <th className="p-3">Proposed</th>
                <th className="p-3">Action Status</th>
                <th className="p-3">Decision Maker</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-blue-400 font-semibold">{h.id}</td>
                  <td className="p-3">{h.date}</td>
                  <td className="p-3 font-sans">{h.type}</td>
                  <td className="p-3 font-sans text-white">{h.room_type}</td>
                  <td className="p-3 text-slate-400">{h.current_val}</td>
                  <td className="p-3 text-emerald-400 font-bold">{h.rec_val}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      h.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-slate-300">{h.user}</td>
                  <td className="p-3 text-right text-slate-400">{h.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
