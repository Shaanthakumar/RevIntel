import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/alerts');
      setAlerts(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Operational Alerts & Notifications
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time threshold alerts across pricing volatility, anomaly detection, and data ingestion
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border text-xs flex items-start gap-3.5 ${
              alert.severity === 'critical'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : alert.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900/60 flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-['Plus_Jakarta_Sans']">
                  {alert.title}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-900/60 rounded">
                  {alert.alert_type}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
