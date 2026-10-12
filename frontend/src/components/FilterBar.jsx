import React from 'react';
import { Filter, Calendar, Home, Users, Share2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function FilterBar({ 
  filterOptions = {}, 
  filters, 
  onFilterChange, 
  onResetFilters 
}) {
  const roomTypes = filterOptions.room_types || ['Standard', 'Deluxe', 'Executive', 'Suite'];
  const segments = filterOptions.customer_segments || ['Leisure', 'Business', 'Group', 'Corporate', 'Direct'];
  const channels = filterOptions.distribution_channels || ['OTA', 'Direct', 'Travel Agent', 'Corporate', 'GDS'];
  const statuses = filterOptions.booking_statuses || ['Confirmed', 'Canceled', 'No-Show'];

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          Interactive Revenue Intelligence Filters
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Date Range Start */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" /> Start Date
          </label>
          <input
            type="date"
            value={filters.start_date || ''}
            min={filterOptions.min_date}
            max={filterOptions.max_date}
            onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" /> End Date
          </label>
          <input
            type="date"
            value={filters.end_date || ''}
            min={filterOptions.min_date}
            max={filterOptions.max_date}
            onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Home className="w-3 h-3 text-cyan-400" /> Room Type
          </label>
          <select
            value={filters.room_type || 'All'}
            onChange={(e) => onFilterChange({ ...filters, room_type: e.target.value })}
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Room Types</option>
            {roomTypes.map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>

        {/* Customer Segment */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-400" /> Segment
          </label>
          <select
            value={filters.segment || 'All'}
            onChange={(e) => onFilterChange({ ...filters, segment: e.target.value })}
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Segments</option>
            {segments.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Distribution Channel */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Share2 className="w-3 h-3 text-emerald-400" /> Channel
          </label>
          <select
            value={filters.channel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, channel: e.target.value })}
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Channels</option>
            {channels.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
