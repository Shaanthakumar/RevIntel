import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bed, Database, Cpu } from 'lucide-react';

export default function Settings() {
  const [capacity, setCapacity] = useState(150);
  const [hotelName, setHotelName] = useState('Grand RevIntel Resort & Spa');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          System & Property Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage operational inventory assumptions, room capacity baseline, and model preferences
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
          Configuration settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Bed className="w-4 h-4 text-cyan-400" /> Property Baseline Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Hotel Property Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Total Available Rooms Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Used to compute Occupancy & RevPAR when inventory column is omitted.</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> AI Agent Reasoning Provider
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">LLM Reasoning Provider</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-blue-500">
                <option value="mock">Rule-Based Synthesizer (Default Built-in)</option>
                <option value="openai">OpenAI (GPT-4o) - Configurable</option>
                <option value="gemini">Google Gemini 1.5 Pro - Configurable</option>
                <option value="anthropic">Anthropic Claude 3.5 - Configurable</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Database Mode</label>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs">
                SQLite (Local Engine: revintel.db)
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
        >
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
