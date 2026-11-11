import React, { useState } from 'react';
import { Sliders, RotateCcw, Check, Sparkles, Shield, Cpu, Database } from 'lucide-react';
import { DiscoveryWeights } from '../types';

interface SettingsProps {
  weights: DiscoveryWeights;
  onUpdateWeights: (newWeights: DiscoveryWeights) => void;
}

export const Settings: React.FC<SettingsProps> = ({ weights, onUpdateWeights }) => {
  const [localWeights, setLocalWeights] = useState<DiscoveryWeights>(weights);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const defaultWeights: DiscoveryWeights = {
    semantic_weight: 0.45,
    role_weight: 0.20,
    education_weight: 0.15,
    network_weight: 0.10,
    location_weight: 0.10
  };

  const handleSliderChange = (key: keyof DiscoveryWeights, val: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: val / 100
    }));
  };

  const handleSave = () => {
    onUpdateWeights(localWeights);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setLocalWeights(defaultWeights);
    onUpdateWeights(defaultWeights);
  };

  const sumPercent = Math.round(
    (localWeights.semantic_weight +
      localWeights.role_weight +
      localWeights.education_weight +
      localWeights.network_weight +
      localWeights.location_weight) *
      100
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
          <Sliders className="w-3.5 h-3.5" />
          <span>Section 5 AI/ML Methodology Settings</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scoring Weights & Parameters</h1>
        <p className="text-sm text-slate-500">
          Adjust the hybrid formula coefficients. Normalization occurs automatically across available features.
        </p>
      </div>

      {/* Formula Customizer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hybrid Ranking Formula Weights</h3>
            <p className="text-xs text-slate-500">
              Standard: Final Score = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                sumPercent === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Total: {sumPercent}%
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5 text-xs">
          {/* Semantic Weight */}
          <div>
            <div className="flex justify-between font-semibold mb-1.5">
              <span className="text-slate-800">S — Semantic Similarity (Dense Vector Cosine)</span>
              <span className="font-mono font-bold text-blue-600">
                {Math.round(localWeights.semantic_weight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={Math.round(localWeights.semantic_weight * 100)}
              onChange={(e) => handleSliderChange('semantic_weight', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Role Similarity */}
          <div>
            <div className="flex justify-between font-semibold mb-1.5">
              <span className="text-slate-800">R — Role & Leadership Seniority Match</span>
              <span className="font-mono font-bold text-blue-600">
                {Math.round(localWeights.role_weight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={Math.round(localWeights.role_weight * 100)}
              onChange={(e) => handleSliderChange('role_weight', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Education Relevance */}
          <div>
            <div className="flex justify-between font-semibold mb-1.5">
              <span className="text-slate-800">E — School Education Relevance (CBSE/ICSE/IB Indicators)</span>
              <span className="font-mono font-bold text-blue-600">
                {Math.round(localWeights.education_weight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={Math.round(localWeights.education_weight * 100)}
              onChange={(e) => handleSliderChange('education_weight', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Network Experience */}
          <div>
            <div className="flex justify-between font-semibold mb-1.5">
              <span className="text-slate-800">N — Multi-School Network Exposure & Campuses Led</span>
              <span className="font-mono font-bold text-blue-600">
                {Math.round(localWeights.network_weight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={Math.round(localWeights.network_weight * 100)}
              onChange={(e) => handleSliderChange('network_weight', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Location Relevance */}
          <div>
            <div className="flex justify-between font-semibold mb-1.5">
              <span className="text-slate-800">L — Geographic / Regional Proximity</span>
              <span className="font-mono font-bold text-blue-600">
                {Math.round(localWeights.location_weight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={Math.round(localWeights.location_weight * 100)}
              onChange={(e) => handleSliderChange('location_weight', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Weights</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? 'Weights Applied!' : 'Apply Custom Weights'}</span>
          </button>
        </div>
      </div>

      {/* Backend & Model Stack Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">System Environment & Runtime Diagnostics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Vector Embeddings</span>
            <p className="font-bold text-slate-800 mt-1">all-MiniLM-L6-v2</p>
            <p className="text-[11px] text-slate-500">384 Dimensions (Cosine)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Database Adapter</span>
            <p className="font-bold text-slate-800 mt-1">SQLite + pgvector SQL</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Active & Seeded (30 records)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">AI Extraction Engine</span>
            <p className="font-bold text-slate-800 mt-1">Gemini API / Hybrid Regex</p>
            <p className="text-[11px] text-blue-600 font-semibold">Pydantic Schema Validated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

