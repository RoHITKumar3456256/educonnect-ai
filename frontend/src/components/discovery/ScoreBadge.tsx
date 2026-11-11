import React, { useState } from 'react';
import { ScoreBreakdown } from '../../types';
import { Info } from 'lucide-react';

interface ScoreBadgeProps {
  scores: ScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ scores, size = 'md' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const finalScore = scores.final_score;
  const band = scores.relevance_band;

  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeColor = 'bg-emerald-600';
  let label = 'High Fit';

  if (band === 'Medium' || (finalScore >= 60 && finalScore < 80)) {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeColor = 'bg-amber-500';
    label = 'Medium Fit';
  } else if (band === 'Low' || finalScore < 60) {
    bgClass = 'bg-slate-50 text-slate-600 border-slate-200';
    badgeColor = 'bg-slate-400';
    label = 'Low Fit';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center space-x-1.5 rounded-full border font-semibold shadow-2xs cursor-pointer transition hover:opacity-95 ${bgClass} ${sizeClasses[size]}`}
      >
        <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
        <span>{Math.round(finalScore)}% Match</span>
        <span className="text-[10px] font-normal opacity-75">({label})</span>
      </div>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 border border-slate-800 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Hybrid Match Breakdown</span>
            <span className="font-bold text-emerald-400">{finalScore}%</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Semantic Vector (45%):</span>
              <span className="font-mono text-slate-200">{scores.semantic_score}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Role & Seniority (20%):</span>
              <span className="font-mono text-slate-200">{scores.role_score}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">School Relevance (15%):</span>
              <span className="font-mono text-slate-200">{scores.education_score}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Network Exposure (10%):</span>
              <span className="font-mono text-slate-200">{scores.network_score}%</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Location Proximity (10%):</span>
              <span className="font-mono text-slate-200">{scores.location_score}%</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
            Formula: 0.45S + 0.20R + 0.15E + 0.10N + 0.10L
          </div>
        </div>
      )}
    </div>
  );
};

