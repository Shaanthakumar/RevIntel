import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Check, X, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function DynamicPricing() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/pricing/recommendations');
      setRecommendations(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recId, actionStatus) => {
    try {
      await axios.post(`/api/recommendations/${recId}/action`, {
        status: actionStatus,
        action_taken_by: 'revenue_manager'
      });
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendation_id === recId ? { ...r, status: actionStatus } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Dynamic Pricing Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-driven rate adjustments based on forecast compression, booking velocity, and room category elasticity
          </p>
        </div>
        <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-cyan-400 rounded-lg text-xs font-mono">
          Phase 6 AI Pricing Interface
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.recommendation_id} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400 block">{rec.recommendation_id} • {rec.target_date}</span>
                <h4 className="font-bold text-white text-base">{rec.room_type} Room</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                rec.status === 'Accepted'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : rec.status === 'Rejected'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {rec.status}
              </span>
            </div>

            {/* Price Compare */}
            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Current ADR</span>
                <span className="text-sm font-semibold text-slate-300">${rec.current_adr}</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Recommended ADR</span>
                <span className="text-base font-extrabold text-emerald-400">${rec.recommended_adr}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Expected Impact</span>
                <span className="text-xs font-bold text-cyan-400">+${rec.expected_revenue_impact}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Rationale:</strong> {rec.reason}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Confidence: <strong className="text-white font-mono">{Math.round(rec.confidence_score * 100)}%</strong></span>
              <span>Risk: <strong className="text-emerald-400">{rec.risk_level}</strong></span>
              
              {rec.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(rec.recommendation_id, 'Rejected')}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30"
                    title="Reject Recommendation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAction(rec.recommendation_id, 'Accepted')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1"
                    title="Accept Recommendation"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
