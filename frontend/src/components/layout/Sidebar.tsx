import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Bookmark,
  BarChart3,
  Database,
  Sliders,
  GraduationCap,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, savedCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'New Discovery', icon: Sparkles, badge: 'AI Search' },
    { id: 'results', label: 'Candidate Results', icon: Users },
    { id: 'saved', label: 'Saved Shortlist', icon: Bookmark, count: savedCount },
    { id: 'analytics', label: 'Network Analytics', icon: BarChart3 },
    { id: 'datasources', label: 'Data Sources & Ethics', icon: Database },
    { id: 'settings', label: 'Weights & Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">EduConnect</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400">School Influencer Discovery</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-slate-800 text-blue-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance & Environment Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized & Traceable</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Zero unauthorized scraping. Explainable semantic matching across verified school ecosystem leaders.
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>v1.0.0 • EDXSO MVP</span>
          <span className="flex items-center space-x-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Engine</span>
          </span>
        </div>
      </div>
    </aside>
  );
};

