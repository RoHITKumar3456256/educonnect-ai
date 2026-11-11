import React from 'react';
import { X, Network, ExternalLink, Award, Building, BookOpen, Users } from 'lucide-react';
import { Profile } from '../../types';

interface NetworkGraphModalProps {
  profile: Profile | null;
  onClose: () => void;
}

export const NetworkGraphModal: React.FC<NetworkGraphModalProps> = ({ profile, onClose }) => {
  if (!profile) return null;

  // Mock nodes connecting to this influencer
  const connections = [
    { type: 'Advisory Board', title: 'CBSE Curriculum Council', label: 'National Council', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { type: 'Partner School Network', title: `${profile.organisation} Cluster`, label: `${profile.schools_count || 5}+ Campuses`, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { type: 'Collaborator', title: 'Turnaround Taskforce', label: 'Peer Leaders', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { type: 'Academic Summit', title: 'EDX Global / Bett Asia', label: 'Keynote Panel', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional Network Map</h2>
              <p className="text-xs text-slate-500">Multi-school ecosystem connections & advisory graph</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Multi-School Impact</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{profile.schools_count || 1}+</p>
              <p className="text-[10px] text-slate-400">Affiliated institutions</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tenure Depth</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{profile.experience_years} yrs</p>
              <p className="text-[10px] text-slate-400">Leadership tenure</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Influence Index</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">Tier A</p>
              <p className="text-[10px] text-slate-400">Education sector rank</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Verification</span>
              <p className="text-sm font-bold text-slate-800 mt-2 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="capitalize">{profile.verification_status || 'Verified'}</span>
              </p>
              <p className="text-[10px] text-slate-400">Source audited</p>
            </div>
          </div>

          {/* Interactive Network Graph Canvas Representation */}
          <div className="relative h-72 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-6 select-none">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

            {/* Connecting Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/30 stroke-2">
              <line x1="50%" y1="50%" x2="20%" y2="25%" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="80%" y2="25%" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="20%" y2="75%" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" strokeDasharray="4 4" />
            </svg>

            {/* Center Node (Current Profile) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-400 p-0.5 bg-slate-800 shadow-2xl flex items-center justify-center">
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="mt-2 px-3 py-1 bg-white text-slate-900 rounded-lg shadow-lg font-bold text-xs text-center border border-slate-200">
                {profile.name}
                <div className="text-[10px] font-normal text-slate-500">{profile.role_category || 'Leader'}</div>
              </div>
            </div>

            {/* Peripheral Nodes */}
            {/* Node 1: Top Left */}
            <div className="absolute left-[10%] top-[15%] z-10 bg-slate-800 text-white p-2.5 rounded-xl border border-indigo-500/30 shadow-lg text-left max-w-[180px]">
              <div className="flex items-center space-x-1.5 text-indigo-400 text-[10px] font-semibold uppercase">
                <Building className="w-3 h-3" />
                <span>{connections[0].type}</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{connections[0].title}</p>
              <p className="text-[10px] text-slate-400">{connections[0].label}</p>
            </div>

            {/* Node 2: Top Right */}
            <div className="absolute right-[10%] top-[15%] z-10 bg-slate-800 text-white p-2.5 rounded-xl border border-emerald-500/30 shadow-lg text-left max-w-[180px]">
              <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-semibold uppercase">
                <Award className="w-3 h-3" />
                <span>{connections[1].type}</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{connections[1].title}</p>
              <p className="text-[10px] text-slate-400">{connections[1].label}</p>
            </div>

            {/* Node 3: Bottom Left */}
            <div className="absolute left-[10%] bottom-[15%] z-10 bg-slate-800 text-white p-2.5 rounded-xl border border-purple-500/30 shadow-lg text-left max-w-[180px]">
              <div className="flex items-center space-x-1.5 text-purple-400 text-[10px] font-semibold uppercase">
                <Users className="w-3 h-3" />
                <span>{connections[2].type}</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{connections[2].title}</p>
              <p className="text-[10px] text-slate-400">{connections[2].label}</p>
            </div>

            {/* Node 4: Bottom Right */}
            <div className="absolute right-[10%] bottom-[15%] z-10 bg-slate-800 text-white p-2.5 rounded-xl border border-amber-500/30 shadow-lg text-left max-w-[180px]">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-semibold uppercase">
                <BookOpen className="w-3 h-3" />
                <span>{connections[3].type}</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{connections[3].title}</p>
              <p className="text-[10px] text-slate-400">{connections[3].label}</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-800 flex items-center justify-between">
            <span>Graph nodes reflect evidenced advisory relations, institutional councils, and multi-school governance roles.</span>
            <span className="font-semibold text-blue-900 cursor-pointer hover:underline" onClick={onClose}>Close view</span>
          </div>
        </div>
      </div>
    </div>
  );
};

