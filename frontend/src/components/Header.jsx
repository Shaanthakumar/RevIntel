import React, { useState } from 'react';
import { Bed, RefreshCw, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  inventoryCapacity, 
  onUpdateInventory, 
  onLoadSample,
  loading 
}) {
  const [editingInventory, setEditingInventory] = useState(false);
  const [tempCapacity, setTempCapacity] = useState(inventoryCapacity || 150);

  const titles = {
    dashboard: { title: 'Hotel Revenue Intelligence Dashboard', sub: 'Real-time revenue KPIs, occupancy trends & statistical anomaly monitoring' },
    upload: { title: 'Hotel Booking Data Ingestion & Quality', sub: 'Upload CSV/Excel booking datasets, inspect columns & verify data quality' },
    analysis: { title: 'Revenue & Channel Performance Analysis', sub: 'Deep-dive room type performance, lead time pace & distribution breakdown' },
    insights: { title: 'Intelligent Revenue Insights & Alerts', sub: 'Automated rule-based revenue intelligence & statistical anomaly feed' }
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  const handleSaveInventory = () => {
    onUpdateInventory(Number(tempCapacity));
    setEditingInventory(false);
  };

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          {currentInfo.title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentInfo.sub}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Room Capacity Assumption Widget */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs">
          <Bed className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Inventory Capacity:</span>
          {editingInventory ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={tempCapacity}
                onChange={(e) => setTempCapacity(e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-slate-900 border border-blue-500 rounded text-white text-xs font-mono"
              />
              <button
                onClick={handleSaveInventory}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingInventory(true)}
              className="font-bold text-white hover:text-cyan-300 underline font-mono decoration-dashed"
              title="Click to change room capacity assumption for Occupancy & RevPAR calculations"
            >
              {inventoryCapacity || 150} Rooms/Day
            </button>
          )}
        </div>

        {/* Load Sample Dataset Button */}
        <button
          onClick={onLoadSample}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/10 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Load Demo Dataset
        </button>
      </div>
    </header>
  );
}
