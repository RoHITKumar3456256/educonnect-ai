import React from 'react';
import { ShieldCheck, Database, CheckCircle, AlertTriangle, FileText, Lock, Globe } from 'lucide-react';

export const DataSources: React.FC = () => {
  const sources = [
    {
      name: 'National School Leadership Directories & Public Portals',
      type: 'public_institution_page',
      permission: 'Publicly Accessible / Permitted Use',
      count: 18,
      notes: 'Curated institutional websites, principal rosters, and official state board inspection registers.',
      status: 'Active'
    },
    {
      name: 'All India Education Summits & Conferences Bio Registry',
      type: 'conference_speaker_bio',
      permission: 'Public Speaker Profiles',
      count: 8,
      notes: 'Keynotes and panelists from Bett Asia, EDX Global, and FICCI Higher & School Education Summits.',
      status: 'Active'
    },
    {
      name: 'Authorised School Trustee & Board Registry',
      type: 'curated_directory',
      permission: 'Direct Foundation Listings',
      count: 4,
      notes: 'Public trust deeds, governing council minutes, and authorized institution annual reports.',
      status: 'Active'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Section 6 Compliance & Data Provenance</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Sources & Ethical Ingestion</h1>
        <p className="text-sm text-slate-500">
          EduConnect AI operates on strictly authorized, public, and verifiable sources with traceable evidence.
        </p>
      </div>

      {/* Compliance Charter Box */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-emerald-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Zero-Scraping Platform Compliance Policy</h2>
            <p className="text-xs text-slate-500">Strict adherence to Terms of Service, Privacy Laws & Ethical AI Guidelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No LinkedIn Scraping</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Pasting a LinkedIn URL does not trigger unauthorized scraping. URLs serve strictly as immutable external reference identifiers.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No CAPTCHA Bypass</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              We never attempt to bypass authentication walls, cloudflare turnstiles, or anti-bot protections.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Evidence Traceability</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Every score, claim, and match explanation is backed by an explicit quote from an audited public record.
            </p>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Authorized Datasets in Current MVP Build</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Source Registry</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Permission Legal Basis</th>
                <th className="py-3 px-4 text-center">Records</th>
                <th className="py-3 px-4">Integrity Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700 bg-blue-50/50 rounded-md">
                    {s.type}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-emerald-700">{s.permission}</td>
                  <td className="py-3.5 px-4 font-black text-slate-800 text-center">{s.count}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

