import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, ShieldCheck, Check, X, Share2 } from 'lucide-react';

export default function InventoryAllocation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/inventory/recommendations');
      setRecommendations(res.data.items);
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
            Room Inventory & Channel Allocation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Capacity protection and channel mix optimization (EMSR & nested inventory allocation)
          </p>
        </div>
        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-cyan-400 rounded-lg text-xs font-mono">
          Phase 7 Optimization Interface
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.recommendation_id} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400 block">{rec.recommendation_id} • {rec.target_date}</span>
                <h4 className="font-bold text-white text-base">{rec.channel} Channel • {rec.room_type}</h4>
              </div>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold font-mono">
                {rec.strategy}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Allocated Rooms</span>
                <strong className="text-white text-base">{rec.allocated_rooms} Rooms</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Share %</span>
                <strong className="text-cyan-400 text-base">{rec.allocation_pct}%</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Confidence</span>
                <strong className="text-emerald-400 text-base">{Math.round(rec.confidence_score * 100)}%</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Rationale:</strong> {rec.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
