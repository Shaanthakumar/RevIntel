import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  TrendingUp, 
  Lightbulb, 
  Database, 
  BrainCircuit, 
  DollarSign, 
  Layers, 
  Users, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, datasetInfo }) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Data Upload', icon: UploadCloud },
    { id: 'analysis', label: 'Revenue Analysis', icon: TrendingUp },
    { id: 'insights', label: 'Insights & Alerts', icon: Lightbulb },
  ];

  const futureModules = [
    { name: 'Demand Forecasting', tag: 'ML Agent', icon: TrendingUp },
    { name: 'Dynamic Pricing Rec.', tag: 'AI Agent', icon: DollarSign },
    { name: 'Room Allocation', tag: 'Optimization', icon: Layers },
    { name: 'Customer Segmentation', tag: 'Clustering', icon: Users },
    { name: 'AI Revenue Agent', tag: 'LLM Agent', icon: Sparkles },
    { name: 'Competitive Rate Analysis', tag: 'Crawler', icon: BrainCircuit },
  ];

  const qualityScore = datasetInfo?.quality_report?.quality_score || 95.0;

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
            RevIntel
          </h1>
          <p className="text-[10px] font-medium text-cyan-400 tracking-wider uppercase">
            AI Revenue Agent
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Module
        </div>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Active Dataset Status Widget */}
      <div className="mx-3 my-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Dataset Status
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
            qualityScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {qualityScore}% Quality
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate font-mono" title={datasetInfo?.filename}>
          {datasetInfo?.filename || 'Synthetic_Demo_Hotel_Data.csv'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {datasetInfo?.quality_report?.total_rows?.toLocaleString() || 1250} rows processed
        </p>
      </div>

      {/* Extensibility Placeholder Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Future AI Modules</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 font-mono">
            Coming Soon
          </span>
        </div>
        {futureModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-500 bg-slate-900/30 border border-slate-800/50 cursor-not-allowed opacity-75 hover:opacity-100 transition-opacity"
              title={`${m.name} - Planned AI Module`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">{m.name}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono flex-shrink-0">
                {m.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        RevIntel Agent v1.0 • Final-Year Project
      </div>
    </aside>
  );
}
