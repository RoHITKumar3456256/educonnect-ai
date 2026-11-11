import React from 'react';
import { Search, Sparkles, SlidersHorizontal, Bell, HelpCircle, Play } from 'lucide-react';

interface TopbarProps {
  onSearchGlobal?: (query: string) => void;
  onOpenDiscovery?: () => void;
  onOpenDemoVideo?: () => void;
  activeRunTitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearchGlobal, onOpenDiscovery, onOpenDemoVideo, activeRunTitle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-xs">
      {/* Left: Active Workspace / Context */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">K-12 School Influencer Hub</span>
          </div>
          <h1 className="text-sm font-semibold text-slate-900 truncate max-w-md">
            {activeRunTitle || 'All Tracked School Ecosystem Leaders'}
          </h1>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center space-x-3">
        {/* Watch Demo Video Walkthrough Button */}
        <button
          onClick={onOpenDemoVideo}
          className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition shadow-2xs"
        >
          <Play className="w-3.5 h-3.5 fill-red-600 text-red-600" />
          <span>Watch 5-10m Demo Video</span>
        </button>

        {/* Quick Discovery CTA */}
        <button
          onClick={onOpenDiscovery}
          className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run AI Discovery</span>
        </button>

        {/* Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Sentence Transformers + pgvector</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ED
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">EDXSO Intern</p>
            <p className="text-[10px] text-slate-600 leading-tight">Reviewer Mode</p>
          </div>
        </div>
      </div>
    </header>
  );
};

