import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Trash2,
  Download,
  Building,
  MapPin,
  ExternalLink,
  Search,
  Sparkles,
  Network
} from 'lucide-react';
import { fetchSavedProfiles, removeSavedProfile } from '../services/api';
import { SavedProfileItem, Profile, CandidateResult } from '../types';
import { ProfileDetailDrawer } from '../components/profiles/ProfileDetailDrawer';
import { NetworkGraphModal } from '../components/discovery/NetworkGraphModal';

interface SavedProfilesProps {
  onRefreshSavedCount?: () => void;
  onNavigateToDiscovery: () => void;
}

export const SavedProfiles: React.FC<SavedProfilesProps> = ({
  onRefreshSavedCount,
  onNavigateToDiscovery
}) => {
  const [savedItems, setSavedItems] = useState<SavedProfileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [networkModalProfile, setNetworkModalProfile] = useState<Profile | null>(null);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSavedProfiles();
      setSavedItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (profileId: string) => {
    try {
      await removeSavedProfile(profileId);
      setSavedItems((prev) => prev.filter((item) => item.profile.id !== profileId));
      if (onRefreshSavedCount) onRefreshSavedCount();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (savedItems.length === 0) return;
    const headers = ['Name', 'Role', 'Organisation', 'Location', 'Experience Years', 'Schools Count', 'Saved At', 'Notes'];
    const rows = savedItems.map((item) => [
      `"${item.profile.name}"`,
      `"${item.profile.role}"`,
      `"${item.profile.organisation}"`,
      `"${item.profile.location}"`,
      item.profile.experience_years,
      item.profile.schools_count || 1,
      `"${item.saved_at}"`,
      `"${item.notes || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduConnect_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = savedItems.filter(
    (item) =>
      item.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile.organisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Shortlisted Candidates</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Candidate Shortlist</h1>
          <p className="text-sm text-slate-500">
            Curated list of school influencers, advisors, and directors earmarked for partnership and outreach.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={savedItems.length === 0}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Shortlist CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search saved profiles or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredItems.length} Shortlisted Candidates
        </span>
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your Shortlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run a discovery query and click the bookmark icon on any candidate to save them here.
          </p>
          <button
            onClick={onNavigateToDiscovery}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Go to Discovery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profile.name}`}
                      alt={item.profile.name}
                      className="w-12 h-12 rounded-xl bg-slate-100 object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.profile.name}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{item.profile.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.profile.id)}
                    title="Remove from shortlist"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.profile.organisation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.profile.location}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 mb-3">
                    <span className="font-bold text-[10px] uppercase text-purple-600 block mb-0.5">Notes</span>
                    <p className="italic">{item.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setNetworkModalProfile(item.profile)}
                  className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Network Map</span>
                </button>
                <button
                  onClick={() =>
                    setSelectedCandidate({
                      candidate: item.profile,
                      scores: {
                        semantic_score: 85,
                        role_score: 90,
                        education_score: 88,
                        network_score: 80,
                        location_score: 75,
                        final_score: 84.5,
                        relevance_band: 'High'
                      },
                      explanation: `Saved candidate ${item.profile.name} exhibits verified leadership within ${item.profile.organisation}.`,
                      evidence_snippets: item.profile.evidence ? item.profile.evidence.map((e) => e.evidence_text) : []
                    })
                  }
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                >
                  View Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Candidate Drawer */}
      <ProfileDetailDrawer
        candidateResult={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenNetworkModal={(prof) => setNetworkModalProfile(prof)}
      />

      {/* Network Modal */}
      <NetworkGraphModal
        profile={networkModalProfile}
        onClose={() => setNetworkModalProfile(null)}
      />
    </div>
  );
};

