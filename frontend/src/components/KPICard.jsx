import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  unit = '', 
  prevValue, 
  changePct = 0, 
  trend = 'up',
  invertTrendColor = false,
  icon: Icon,
  accentColor = 'blue' 
}) {
  const isPositive = changePct >= 0;
  // For Cancellation Rate, lower is better (invert color)
  const isGood = invertTrendColor ? !isPositive : isPositive;

  const colorClasses = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  };

  const selectedColor = colorClasses[accentColor] || colorClasses.blue;

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-700">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${selectedColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] font-mono">
          {unit === '$' ? `$${Number(value).toLocaleString()}` : `${Number(value).toLocaleString()}${unit}`}
        </span>
      </div>

      {/* Period-Over-Period Comparison */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400">
        <span className="truncate">
          Prev: <strong className="text-slate-300 font-mono">{unit === '$' ? `$${prevValue}` : `${prevValue}${unit}`}</strong>
        </span>

        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-medium text-[11px] ${
          changePct === 0 
            ? 'bg-slate-800 text-slate-400' 
            : isGood 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
        }`}>
          {changePct > 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : changePct < 0 ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {Math.abs(changePct)}%
        </span>
      </div>
    </div>
  );
}
