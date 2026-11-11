import React, { useEffect, useState } from 'react';
import {
  Users,
  Sparkles,
  Bookmark,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Layers,
  History
} from 'lucide-react';
import { fetchAnalytics, fetchProfiles, fetchRecentDiscoveryRuns, fetchDiscoveryRun } from '../services/api';
import { AnalyticsOverview, Profile, DiscoveryRunResponse } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectProfileForDiscovery?: (profile: Profile) => void;
  onLoadRun?: (runData: DiscoveryRunResponse) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectProfileForDiscovery, onLoadRun }) => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [featuredProfiles, setFeaturedProfiles] = useState<Profile[]>([]);
  const [recentRuns, setRecentRuns] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, profData, runsData] = await Promise.all([
          fetchAnalytics(),
          fetchProfiles({ limit: 4 }),
          fetchRecentDiscoveryRuns().catch(() => [])
        ]);
        setAnalytics(anData);
        setFeaturedProfiles(profData);
        setRecentRuns(runsData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenRun = async (runId: string) => {
    try {
      const data = await fetchDiscoveryRun(runId);
      if (onLoadRun) onLoadRun(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#3A506B] p-8 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered School Ecosystem Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find the right people. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
              Build the right school network.
            </span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            EduConnect AI matches reference education leaders against an authorized, traceable candidate pool using dense sentence embeddings and deterministic multi-signal ranking.
          </p>
          <div className="pt-2 flex items-center space-x-4">
            <button
              onClick={() => onNavigate('discovery')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Discovery</span>
            </button>
            <button
              onClick={() => onNavigate('datasources')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Review Data Ethics</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid and glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Cards (Live from Database) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidate Pool</span>
            <p className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : analytics?.total_profiles || 0}
            </p>
            <p className="text-[11px] text-slate-400">Authorized education leaders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Discovery Runs</span>
            <p className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : analytics?.total_discovery_runs || 0}
            </p>
            <p className="text-[11px] text-slate-400">Executed pipeline runs</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shortlisted</span>
            <p className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : analytics?.total_shortlisted || 0}
            </p>
            <p className="text-[11px] text-slate-400">Saved for outreach</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified Provenance</span>
            <p className="text-2xl font-black text-slate-900">
              {isLoading ? '...' : analytics?.verified_count || 0}
            </p>
            <p className="text-[11px] text-slate-400">100% Traceable profiles</p>
          </div>
        </div>
      </div>

      {/* Featured Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Curated K-12 Leadership Pool</h2>
            <p className="text-xs text-slate-500">
              Sample authorized profiles across Principals, School Directors, Turnaround Consultants & Trustees
            </p>
          </div>
          <button
            onClick={() => onNavigate('discovery')}
            className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Explore Discovery Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProfiles.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl bg-slate-100 object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{p.name}</h3>
                    <p className="text-xs text-blue-600 font-medium truncate">{p.role}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {p.role_category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.organisation}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.experience_years} Years Experience</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectProfileForDiscovery) onSelectProfileForDiscovery(p);
                  onNavigate('discovery');
                }}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Use as Reference</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Discovery Runs Table */}
      {recentRuns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Recent Discovery Runs</span>
            </h3>
            <span className="text-xs text-slate-400">{recentRuns.length} executed runs stored</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentRuns.slice(0, 5).map((run) => (
              <div
                key={run.run_id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                    RUN
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{run.reference_name || 'Discovery Run'}</h4>
                    <p className="text-[11px] text-slate-400">
                      ID: {run.run_id} • {new Date(run.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {run.candidates_count} Candidates Ranked
                  </span>
                  <button
                    onClick={() => handleOpenRun(run.run_id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-slate-700 transition"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology & Architecture Highlight */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Hybrid Re-ranking Methodology</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Candidate relevance is not driven by LLM hallucination. Scoring uses:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-slate-800 font-bold">
              Final = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L
            </code>
            integrating Sentence Transformers cosine similarity, role seniority matching, school sector depth, network footprint, and regional proximity.
          </p>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="shrink-0 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition"
        >
          Customize Scoring Weights
        </button>
      </div>
    </div>
  );
};

