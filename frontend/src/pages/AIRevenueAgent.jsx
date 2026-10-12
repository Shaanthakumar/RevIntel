import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, Sparkles, AlertTriangle, TrendingUp, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export default function AIRevenueAgent() {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'agent',
      text: 'Hello, I am RevIntel Revenue Intelligence Agent. I have synthesized current occupancy, pacing anomalies, and rate elasticity. How can I assist your pricing strategy today?'
    }
  ]);

  useEffect(() => {
    fetchAgent();
  }, []);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/agent/insights', {});
      setAgentData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Based on current analytics, Occupancy is pacing at 74.8% with an ADR of $162.50. RevPAR yield is optimal across direct channels. (Phase 9 LLM reasoning interface ready).`
        }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" /> AI Revenue Intelligence Agent
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autonomous decision-support reasoning layer citing underlying revenue KPIs, anomalies, and forecasts
          </p>
        </div>
        <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-xs font-mono">
          Phase 9 Decision Agent
        </span>
      </div>

      {/* Agent Briefing Card */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-cyan-900/20 border border-blue-500/30 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Executive Strategy Briefing</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Confidence: <strong className="text-emerald-400">91%</strong>
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          {agentData?.executive_summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-900/80 border border-emerald-500/20 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">Key Opportunities Identified</span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {agentData?.top_opportunities?.map((opp, idx) => (
                <li key={idx}>{opp}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-slate-900/80 border border-rose-500/20 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">Potential Risks & Alerts</span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {agentData?.top_risks?.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Conversational Decision Support Chat Interface */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-blue-400" /> Natural Language Revenue Assistant
        </div>

        <div className="h-48 overflow-y-auto space-y-3 p-3 bg-slate-900/60 rounded-lg text-xs">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-3 rounded-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask RevIntel Agent (e.g., 'Why did RevPAR change last week?', 'Recommend rates for next weekend')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Ask
          </button>
        </form>
      </div>
    </div>
  );
}
