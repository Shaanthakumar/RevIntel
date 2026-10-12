import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Table, 
  Sparkles, 
  Search, 
  Clock, 
  Database,
  ArrowRight,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

export default function DataManagement() {
  const [quality, setQuality] = useState(null);
  const [preview, setPreview] = useState([]);
  const [detectedFields, setDetectedFields] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState('hotel_bookings_sample.csv');
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchQuality();
    fetchHistory();
  }, []);

  const fetchQuality = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/data/quality');
      setQuality(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/data/history');
      setHistory(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post('/api/data/upload', formData);
      setFilename(res.data.filename);
      setQuality(res.data.quality_report);
      setDetectedFields(res.data.detected_fields);
      setPreview(res.data.sample_preview);
      setMessage({
        type: 'success',
        text: `Successfully ingested and saved ${res.data.filename} (${res.data.db_persisted_count || 'all'} records saved to database)!`
      });
      fetchHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post('/api/data/sample');
      setFilename(res.data.filename);
      setQuality(res.data.quality_report);
      setDetectedFields(res.data.detected_fields);
      setPreview(res.data.sample_preview);
      setMessage({
        type: 'success',
        text: `Standard 1,200 booking sample dataset loaded and persisted to database!`
      });
      fetchHistory();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load sample dataset' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPreview = preview.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const paginatedPreview = filteredPreview.slice(
    (previewPage - 1) * recordsPerPage,
    previewPage * recordsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> Hotel Data Management & Ingestion Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest CSV/Excel booking data, audit schema mappings, calculate data health score, and persist to database
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono font-semibold">
          Phase 1 Pipeline Active
        </span>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-md ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold hover:opacity-80">✕</button>
        </div>
      )}

      {/* Upload Box & Quality Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Container */}
        <div className="lg:col-span-2 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-8 flex flex-col items-center justify-center bg-[#1e293b]/40 transition-colors">
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-3 text-blue-400">
            {loading ? <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {loading ? 'Processing Dataset...' : 'Upload Hotel Booking Dataset'}
          </h3>
          <p className="text-xs text-slate-400 mb-4 text-center max-w-md">
            Drag and drop CSV or Excel files. Automated pipeline handles date parsing, component dates, column synonyms, and zero-division safeguards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors flex items-center gap-1.5">
              <span>Select File (.csv, .xlsx)</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                disabled={loading}
              />
            </label>

            <span className="text-xs text-slate-500">or</span>

            <button
              onClick={handleLoadSample}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Load Sample Dataset (1,200 Rows)
            </button>
          </div>
        </div>

        {/* Data Health Score Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Data Health Score
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400">{quality?.quality_score || 95}%</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${quality?.quality_score || 95}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Total Rows:</span>
                <span className="font-mono font-bold text-white">{quality?.total_rows || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Total Columns:</span>
                <span className="font-mono font-bold text-white">{quality?.total_columns || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Missing Values Ratio:</span>
                <span className="font-mono text-cyan-400">{quality?.missing_value_pct || 0}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Duplicate Records:</span>
                <span className="font-mono text-amber-400">{quality?.duplicate_rows || 0}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span>Invalid Numerics:</span>
                <span className="font-mono text-slate-400">{quality?.invalid_numeric_count || 0}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 truncate">
            Active Dataset: <strong className="text-white font-mono">{filename}</strong>
          </div>
        </div>
      </div>

      {/* Schema & Column Synonym Resolver Inspector */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" /> Detected Standard Hotel Field Mapping
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { key: 'arrival_date', label: 'Arrival Date' },
            { key: 'adr', label: 'ADR Rate' },
            { key: 'lead_time', label: 'Lead Time' },
            { key: 'room_type', label: 'Room Type' },
            { key: 'booking_status', label: 'Booking Status' },
            { key: 'customer_segment', label: 'Segment' },
            { key: 'distribution_channel', label: 'Channel' },
            { key: 'country', label: 'Country' }
          ].map((item) => {
            const mappedTo = detectedFields[item.key];
            const isSynthesized = mappedTo && String(mappedTo).startsWith('Synthesized');
            return (
              <div key={item.key} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
                  {mappedTo && !isSynthesized ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {mappedTo ? String(mappedTo) : 'Missing'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Ingestion Audit History */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Database Ingestion Audit Log (data_uploads table)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Audit Records: <strong className="text-white">{history.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Upload ID</th>
                <th className="p-3">Filename</th>
                <th className="p-3 text-right">Rows</th>
                <th className="p-3 text-right">Duplicates</th>
                <th className="p-3 text-right">Health Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Uploaded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.length > 0 ? (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-blue-400 font-semibold">#{h.id}</td>
                    <td className="p-3 font-sans text-white">{h.filename}</td>
                    <td className="p-3 text-right">{h.rows_count.toLocaleString()}</td>
                    <td className="p-3 text-right text-amber-400">{h.duplicates_count}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{h.quality_score}%</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-400">{new Date(h.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No upload history records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Preview Table */}
      {preview.length > 0 && (
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" /> Active Dataset Preview ({filteredPreview.length} rows)
            </h4>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPreviewPage(1); }}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Arrival Date</th>
                  <th className="p-3">Room Type</th>
                  <th className="p-3 text-right">ADR ($)</th>
                  <th className="p-3 text-right">Lead Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Segment</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3 text-right">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paginatedPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 text-blue-400 font-semibold">{row.booking_id || `REV-${1000 + idx}`}</td>
                    <td className="p-3">{row.arrival_date}</td>
                    <td className="p-3 font-sans text-slate-200">{row.room_type}</td>
                    <td className="p-3 text-right">${row.adr}</td>
                    <td className="p-3 text-right">{row.lead_time}d</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        String(row.booking_status).toLowerCase().includes('cancel')
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {row.booking_status}
                      </span>
                    </td>
                    <td className="p-3 font-sans">{row.customer_segment}</td>
                    <td className="p-3 font-sans">{row.distribution_channel}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${row.room_revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
            <span>Showing page {previewPage} of {Math.ceil(filteredPreview.length / recordsPerPage) || 1}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage === 1}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewPage((p) => p + 1)}
                disabled={previewPage * recordsPerPage >= filteredPreview.length}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
