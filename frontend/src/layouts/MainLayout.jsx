import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  TrendingUp, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  LineChart, 
  DollarSign, 
  Layers, 
  BrainCircuit, 
  Bell, 
  History, 
  Settings,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Core' },
  { path: '/data', label: 'Data Management', icon: Database, section: 'Core' },
  { path: '/analytics', label: 'Revenue Analytics', icon: TrendingUp, section: 'Core' },
  { path: '/bookings', label: 'Bookings', icon: BookOpen, section: 'Core' },
  { path: '/customers', label: 'Customer Analytics', icon: Users, section: 'Core' },
  { path: '/anomalies', label: 'Anomalies', icon: AlertTriangle, section: 'Intelligence' },
  { path: '/forecasting', label: 'Forecasting', icon: LineChart, section: 'Intelligence', badge: 'ML' },
  { path: '/pricing', label: 'Dynamic Pricing', icon: DollarSign, section: 'Intelligence', badge: 'AI' },
  { path: '/inventory', label: 'Inventory Allocation', icon: Layers, section: 'Intelligence', badge: 'Opt' },
  { path: '/agent', label: 'AI Revenue Agent', icon: BrainCircuit, section: 'Decision', badge: 'Agent' },
  { path: '/alerts', label: 'Alerts', icon: Bell, section: 'Decision' },
  { path: '/recommendations', label: 'Recommendation History', icon: History, section: 'Decision' },
  { path: '/settings', label: 'Settings', icon: Settings, section: 'System' },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 antialiased overflow-hidden">
      {/* Enterprise SaaS Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-full flex-shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
              RevIntel
            </h1>
            <p className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase">
              AI Revenue Agent
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const prevItem = NAV_ITEMS[idx - 1];
            const showSectionHeader = !prevItem || prevItem.section !== item.section;
            
            return (
              <React.Fragment key={item.path}>
                {showSectionHeader && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.section}
                  </div>
                )}
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-cyan-400 rounded border border-blue-500/20 font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </React.Fragment>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Agent Active
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Property:</span>
            <strong className="text-white font-sans">Grand RevIntel Resort & Spa (150 Rooms)</strong>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
              USD ($)
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Decision Support Mode
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#0b0f19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
