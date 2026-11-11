import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
  FileText,
  Network
} from 'lucide-react';
import { CandidateResult, Profile } from '../../types';
import { saveProfileToShortlist } from '../../services/api';

interface ProfileDetailDrawerProps {
  candidateResult: CandidateResult | null;
  onClose: () => void;
  onOpenNetworkModal: (profile: Profile) => void;
  onSavedSuccess?: () => void;
}

export const ProfileDetailDrawer: React.FC<ProfileDetailDrawerProps> = ({
  candidateResult,
  onClose,
  onOpenNetworkModal,
  onSavedSuccess
}) => {
  if (!candidateResult) return null;

  const { candidate, scores, explanation } = candidateResult;
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfileToShortlist(candidate.id, noteText);
      setIsSaved(true);
      if (onSavedSuccess) onSavedSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const skillsList = candidate.skills
    ? candidate.skills.split(',').map((s) => s.trim())
    : ['School Leadership', 'Curriculum Reform'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
            <div className="flex items-start space-x-4">
              <img
                src={candidate.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`}
                alt={candidate.name}
                className="w-16 h-16 rounded-2xl border-2 border-white shadow-md object-cover bg-white"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{candidate.name}</h2>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600 mt-0.5">{candidate.role}</p>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{candidate.organisation}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{candidate.location}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Spotlight / Match Reasoning (PeopleGPT style) */}
            <div className="rounded-xl p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Match Reason & Spotlight</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                  {Math.round(scores.final_score)}% Match
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {explanation}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Experience</span>
                <p className="text-lg font-black text-slate-800">{candidate.experience_years} Years</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Schools Led/Advised</span>
                <p className="text-lg font-black text-blue-600">{candidate.schools_count || 1}+</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                <p className="text-lg font-black text-slate-800 capitalize">{candidate.role_category || 'Advisor'}</p>
              </div>
            </div>

            {/* Match Component Breakdown */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Deterministic Scoring Signals</span>
              </h3>
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600">Semantic Vector Alignment (45%)</span>
                    <span className="font-bold text-slate-900">{scores.semantic_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${scores.semantic_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600">Role & Seniority Relevance (20%)</span>
                    <span className="font-bold text-slate-900">{scores.role_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${scores.role_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600">School Education Indicators (15%)</span>
                    <span className="font-bold text-slate-900">{scores.education_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${scores.education_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600">Multi-School Network Reach (10%)</span>
                    <span className="font-bold text-slate-900">{scores.network_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scores.network_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600">Geographic Proximity (10%)</span>
                    <span className="font-bold text-slate-900">{scores.location_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${scores.location_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceable Evidence Quotes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Audited Source Evidence</span>
              </h3>
              <div className="space-y-3">
                {candidate.evidence && candidate.evidence.length > 0 ? (
                  candidate.evidence.map((ev, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <p className="text-slate-800 italic leading-relaxed">"{ev.evidence_text}"</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80 pt-2">
                        <span className="font-semibold capitalize text-indigo-700">Source: {ev.source_type.replace(/_/g, ' ')}</span>
                        {ev.source_url && (
                          <a
                            href={ev.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:underline"
                          >
                            <span>Verify Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific external quotes attached.</p>
                )}
              </div>
            </div>

            {/* Core Competencies */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Domain Specializations
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Outreach Notes Form */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Outreach & Evaluation Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add custom notes (e.g. 'Ideal speaker for upcoming K-12 Leadership Round-Table in Nov')..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-between space-x-3">
          <button
            onClick={() => onOpenNetworkModal(candidate)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Network className="w-4 h-4 text-indigo-600" />
            <span>View Network Map</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-xs ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isSaved ? 'Shortlisted' : isSaving ? 'Saving...' : 'Add to Shortlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

