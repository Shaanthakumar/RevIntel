import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Table, 
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';

export default function DataUpload({ 
  datasetInfo, 
  onUploadFile, 
  onLoadSample, 
  loading 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const qualityReport = datasetInfo?.quality_report || {};
  const preview = datasetInfo?.preview || [];
  const detectedFields = datasetInfo?.detected_fields || {};

  const filteredPreview = preview.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center bg-[#1e293b]/50 ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-full mb-3 text-blue-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Drag & Drop Hotel Booking Dataset
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-md">
              Upload hotel reservation datasets in <code className="text-cyan-400">.csv</code> or <code className="text-cyan-400">.xlsx</code> format. Auto-detects lead time, room types, ADR, segments, and channels.
            </p>

            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                Select CSV / Excel File
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
              </label>

              <span className="text-xs text-slate-500">or</span>

              <button
                onClick={onLoadSample}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Load Built-in Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Quality Score Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Data Health Score
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {qualityReport.quality_score || 95.0}%
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${qualityReport.quality_score || 95.0}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Total Records:</span>
                <span className="font-mono font-bold text-white">{qualityReport.total_rows || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Total Columns:</span>
                <span className="font-mono font-bold text-white">{qualityReport.total_columns || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Missing Values:</span>
                <span className="font-mono text-cyan-400">{qualityReport.missing_value_pct || 0}%</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span>Duplicate Rows:</span>
                <span className="font-mono text-amber-400">{qualityReport.duplicate_rows || 0}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Active Dataset: <strong className="text-white font-mono">{datasetInfo?.filename}</strong>
          </div>
        </div>
      </div>

      {/* Detected Core Fields Checklist */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Detected Standard Hotel Field Mapping
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { key: 'arrival_date', label: 'Arrival Date' },
            { key: 'adr', label: 'ADR Rate' },
            { key: 'room_type', label: 'Room Type' },
            { key: 'booking_status', label: 'Booking Status' },
            { key: 'customer_segment', label: 'Segment' },
            { key: 'distribution_channel', label: 'Channel' },
          ].map((item) => {
            const found = detectedFields[item.key];
            return (
              <div key={item.key} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
                  {found ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {found ? `Mapped to: ${found}` : 'Synthesized'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            Dataset Preview (First 15 Rows)
          </h4>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search dataset rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Booking ID</th>
                <th className="p-3">Arrival Date</th>
                <th className="p-3">Room Type</th>
                <th className="p-3">ADR ($)</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Segment</th>
                <th className="p-3">Channel</th>
                <th className="p-3 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPreview.length > 0 ? (
                filteredPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-blue-400 font-semibold">{row.booking_id || `REV-${1000+idx}`}</td>
                    <td className="p-3">{row.arrival_date}</td>
                    <td className="p-3 font-sans text-slate-200">{row.room_type}</td>
                    <td className="p-3">${row.adr}</td>
                    <td className="p-3">{row.lead_time} days</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.is_canceled === 1 || String(row.booking_status).toLowerCase() === 'canceled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {row.booking_status}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-slate-300">{row.customer_segment}</td>
                    <td className="p-3 font-sans text-slate-300">{row.distribution_channel}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${row.room_revenue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No rows match search query
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
