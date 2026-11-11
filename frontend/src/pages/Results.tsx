import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Filter,
  Search,
  ExternalLink,
  Bookmark,
  CheckCircle,
  Network,
  Building,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { CandidateResult, DiscoveryRunResponse, Profile } from '../types';
import { ScoreBadge } from '../components/discovery/ScoreBadge';
import { ProfileDetailDrawer } from '../components/profiles/ProfileDetailDrawer';
import { NetworkGraphModal } from '../components/discovery/NetworkGraphModal';
import { saveProfileToShortlist } from '../services/api';

interface ResultsProps {
  discoveryData: DiscoveryRunResponse | null;
  onNewDiscovery: () => void;
  onRefreshSavedCount?: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  discoveryData,
  onNewDiscovery,
  onRefreshSavedCount
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [networkModalProfile, setNetworkModalProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBand, setFilterBand] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [sortBy, setSortBy] = useState<'final' | 'semantic' | 'experience'>('final');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [shortlistedMap, setShortlistedMap] = useState<Record<string, boolean>>({});

  if (!discoveryData || !discoveryData.top_candidates || discoveryData.top_candidates.length === 0) {
    return (
      <div className="p-12 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Discovery Results</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Submit a reference profile in the New Discovery tab to retrieve and rank school education influencers.
        </p>
        <button
          onClick={onNewDiscovery}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Launch New Discovery
        </button>
      </div>
    );
  }

  const handleQuickSave = async (candidateId: string) => {
    try {
      await saveProfileToShortlist(candidateId, 'Quick saved from discovery results');
      setShortlistedMap((prev) => ({ ...prev, [candidateId]: true }));
      if (onRefreshSavedCount) onRefreshSavedCount();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter & Sort
  let candidates = [...discoveryData.top_candidates];

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    candidates = candidates.filter(
      (c) =>
        c.candidate.name.toLowerCase().includes(q) ||
        c.candidate.role.toLowerCase().includes(q) ||
        c.candidate.organisation.toLowerCase().includes(q) ||
        c.candidate.location.toLowerCase().includes(q)
    );
  }

  if (filterBand !== 'all') {
    candidates = candidates.filter((c) => c.scores.relevance_band === filterBand);
  }

  candidates.sort((a, b) => {
    if (sortBy === 'semantic') return b.scores.semantic_score - a.scores.semantic_score;
    if (sortBy === 'experience') return b.candidate.experience_years - a.candidate.experience_years;
    return b.scores.final_score - a.scores.final_score;
  });

  const topPick = candidates.length > 0 ? candidates[0] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Discovery Run #{discoveryData.run_id}</span>
            <span>•</span>
            <span>{discoveryData.total_candidates_analyzed} Candidates Evaluated</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Ranked Influencer Results
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reference: <span className="font-semibold text-slate-800">{discoveryData.reference_profile_name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/api/discovery/${discoveryData.run_id}/export`}
            download
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={onNewDiscovery}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Search</span>
          </button>
        </div>
      </div>

      {/* Top AI Pick Card (Inspired by Lessie AI reference image 3) */}
      {topPick && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-5">
              <div className="relative">
                <img
                  src={topPick.candidate.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topPick.candidate.name}`}
                  alt={topPick.candidate.name}
                  className="w-20 h-20 rounded-2xl bg-slate-800 object-cover border-2 border-indigo-400/50 shadow-md"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-xs uppercase">
                  Top Match
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Pick — Highest Relevance</span>
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{topPick.candidate.name}</h3>
                <p className="text-xs font-semibold text-blue-200">
                  {topPick.candidate.role} • {topPick.candidate.organisation}
                </p>
                <p className="text-xs text-slate-300 max-w-xl line-clamp-2 pt-1 font-normal">
                  {topPick.explanation}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3 shrink-0">
              <div className="text-right">
                <span className="text-xs text-indigo-200 font-semibold uppercase block">Relevance Score</span>
                <span className="text-3xl font-black text-emerald-400">{topPick.scores.final_score}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNetworkModalProfile(topPick.candidate)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center space-x-1.5"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Network Map</span>
                </button>
                <button
                  onClick={() => setSelectedCandidate(topPick)}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition shadow-md"
                >
                  View Full Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Inspired by Sprouts.ai / Cockpit reference images 2 & 6) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by candidate name, role, school or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-500">Tier:</span>
            <select
              value={filterBand}
              onChange={(e) => setFilterBand(e.target.value as any)}
              className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            >
              <option value="all">All Tiers</option>
              <option value="High">High Fit (80%+)</option>
              <option value="Medium">Medium Fit (60-79%)</option>
              <option value="Low">Low Fit (&lt;60%)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            >
              <option value="final">Final Weighted Score</option>
              <option value="semantic">Semantic Similarity</option>
              <option value="experience">Years Experience</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View (Cockpit style)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Cards Grid View (PeopleGPT style)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {candidates.length} of {discoveryData.top_candidates.length} candidates
        </span>
      </div>

      {/* Conditional Cards Grid View vs Table View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((c, index) => {
            const isSaved = shortlistedMap[c.candidate.id];
            return (
              <div
                key={c.candidate.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={c.candidate.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.candidate.name}`}
                        alt={c.candidate.name}
                        className="w-12 h-12 rounded-xl bg-slate-100 object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{c.candidate.name}</h4>
                        <p className="text-xs text-blue-600 font-semibold">{c.candidate.role}</p>
                      </div>
                    </div>
                    <ScoreBadge scores={c.scores} size="sm" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.candidate.organisation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.candidate.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.candidate.experience_years} yrs exp • {c.candidate.schools_count || 1}+ schools</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-slate-700">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">AI Spotlight</span>
                    <p className="line-clamp-3 leading-relaxed">{c.explanation}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuickSave(c.candidate.id)}
                      className={`p-2 rounded-lg border transition ${
                        isSaved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
                      }`}
                      title="Save to shortlist"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNetworkModalProfile(c.candidate)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Network Map"
                    >
                      <Network className="w-4 h-4 text-indigo-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(c)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Dossier</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      /* Results Table (Inspired by PeopleGPT & Cockpit reference images 2 & 7) */
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Candidate & Role</th>
                <th className="py-3 px-4">Institution & Location</th>
                <th className="py-3 px-4">Experience & Footprint</th>
                <th className="py-3 px-4">Relevance Score</th>
                <th className="py-3 px-4">AI Spotlight Match Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {candidates.map((c, index) => {
                const isSaved = shortlistedMap[c.candidate.id];
                return (
                  <tr
                    key={c.candidate.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 font-bold text-[11px] w-5 text-center">
                          {index + 1}
                        </span>
                        <img
                          src={c.candidate.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.candidate.name}`}
                          alt={c.candidate.name}
                          className="w-10 h-10 rounded-xl bg-slate-100 object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {c.candidate.name}
                          </p>
                          <p className="text-slate-500 text-[11px] font-medium">{c.candidate.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Institution & Location */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{c.candidate.organisation}</p>
                      <p className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{c.candidate.location}</span>
                      </p>
                    </td>

                    {/* Experience & Footprint */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{c.candidate.experience_years} yrs exp</p>
                      <p className="text-emerald-700 font-medium text-[11px]">
                        {c.candidate.schools_count || 1}+ school campuses
                      </p>
                    </td>

                    {/* Relevance Score with Breakdown Tooltip */}
                    <td className="py-4 px-4">
                      <ScoreBadge scores={c.scores} size="md" />
                    </td>

                    {/* AI Spotlight Reason */}
                    <td className="py-4 px-4 max-w-sm">
                      <p className="text-slate-700 text-xs leading-relaxed line-clamp-2">
                        {c.explanation}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleQuickSave(c.candidate.id)}
                          title="Save to shortlist"
                          className={`p-2 rounded-lg border transition ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNetworkModalProfile(c.candidate)}
                          title="View institutional graph"
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        >
                          <Network className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Slide-out Candidate Drawer */}
      <ProfileDetailDrawer
        candidateResult={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenNetworkModal={(prof) => setNetworkModalProfile(prof)}
        onSavedSuccess={() => {
          if (selectedCandidate) {
            setShortlistedMap((prev) => ({ ...prev, [selectedCandidate.candidate.id]: true }));
          }
          if (onRefreshSavedCount) onRefreshSavedCount();
        }}
      />

      {/* Network Modal */}
      <NetworkGraphModal
        profile={networkModalProfile}
        onClose={() => setNetworkModalProfile(null)}
      />
    </div>
  );
};

