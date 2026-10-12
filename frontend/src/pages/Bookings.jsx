import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const fetchBookings = async (p) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/bookings?page=${p}&limit=20`);
      setBookings(res.data.items);
      setTotal(res.data.total);
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
            Hotel Bookings & Reservations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational reservation log with transaction status, rates, and distribution channels
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Total Bookings: <strong className="text-white">{total.toLocaleString()}</strong>
        </span>
      </div>

      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Arrival Date</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">ADR ($)</th>
                <th className="p-3">Nights</th>
                <th className="p-3">Status</th>
                <th className="p-3">Segment</th>
                <th className="p-3">Channel</th>
                <th className="p-3 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-blue-400 font-semibold">{b.booking_reference}</td>
                  <td className="p-3">{b.arrival_date}</td>
                  <td className="p-3">{b.lead_time}d</td>
                  <td className="p-3">${b.adr}</td>
                  <td className="p-3">{b.total_nights}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      b.booking_status.toLowerCase().includes('cancel')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="p-3 font-sans">{b.market_segment}</td>
                  <td className="p-3 font-sans">{b.distribution_channel}</td>
                  <td className="p-3 text-right text-emerald-400 font-bold">${b.room_revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          <span>Showing page {page} of {Math.ceil(total / 20) || 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
