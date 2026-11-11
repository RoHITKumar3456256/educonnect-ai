import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Link2,
  Users,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Layers,
  Building,
  MapPin,
  Clock
} from 'lucide-react';
import { analyzeProfileText, runDiscovery, uploadProfilesCSV } from '../services/api';
import { DiscoveryRunResponse, Profile, ProfileAnalyzeResponse } from '../types';

interface NewDiscoveryProps {
  onDiscoveryComplete: (runData: DiscoveryRunResponse) => void;
  initialReferenceProfile?: Profile | null;
}

export const NewDiscovery: React.FC<NewDiscoveryProps> = ({
  onDiscoveryComplete,
  initialReferenceProfile
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'persona' | 'csv'>('text');
  
  // Inputs
  const [rawText, setRawText] = useState(
    initialReferenceProfile
      ? `${initialReferenceProfile.name} is a ${initialReferenceProfile.role} at ${initialReferenceProfile.organisation} with ${initialReferenceProfile.experience_years} years of experience in ${initialReferenceProfile.location}. Skills include ${initialReferenceProfile.skills}. ${initialReferenceProfile.summary}`
      : ''
  );
  const [profileUrl, setProfileUrl] = useState('');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProfileAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Discovery Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [minExp, setMinExp] = useState(0);
  const [minSchools, setMinSchools] = useState(1);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadStatus, setCsvUploadStatus] = useState<string | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Sample Preloaded Personas
  const samplePersonas = [
    {
      title: 'CBSE Turnaround Principal',
      role: 'Former Principal & School Advisor',
      org: 'Delhi Public School Society',
      location: 'New Delhi, India',
      bio: 'Dr. Rajesh K. Sharma is a Senior Educational Advisor and former Principal with 24 years leading CBSE schools, mentoring 18+ affiliated campuses on curriculum reforms and board accreditation.',
      skills: 'CBSE, Turnaround, Teacher Training, NEP 2020'
    },
    {
      title: 'IB & International Schools Director',
      role: 'Director of Academics',
      org: 'Global International Network',
      location: 'Bengaluru, India',
      bio: 'Meera Nambiar is an International Baccalaureate (IB) consultant and former headmistress with 19 years guiding 12 K-12 institutions across India on inquiry pedagogy and STEM labs.',
      skills: 'IB World Schools, STEM Pedagogy, Faculty Mentorship'
    },
    {
      title: 'School Foundation Managing Trustee',
      role: 'Managing Trustee & Founder',
      org: 'Heritage Valley Educational Trust',
      location: 'Kolkata, India',
      bio: 'Arunav Sengupta has 22 years experience managing 7 affordable private school campuses, specializing in trust governance, philanthropic funding, and school community development.',
      skills: 'Trust Governance, Legal Compliance, Rural Education'
    },
    {
      title: 'K-12 EdTech & AI Edupreneur',
      role: 'Founder & CEO',
      org: 'EduVantage Learning Systems',
      location: 'Mumbai, India',
      bio: 'Pooja Singhania is an education entrepreneur partnering with 25+ private school chains across India to implement blended learning, interactive flat panels, and assessment analytics.',
      skills: 'EdTech Integration, School B2B SaaS, Smart Classrooms'
    }
  ];

  const handleSelectPersona = (persona: typeof samplePersonas[0]) => {
    setRawText(persona.bio);
    setActiveTab('text');
    handleAnalyzeText(persona.bio);
  };

  const handleAnalyzeText = async (overrideText?: string) => {
    const textToAnalyze = overrideText || rawText;
    if (!textToAnalyze.trim() && !profileUrl.trim()) {
      setAnalysisError('Please enter profile text or a reference URL.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await analyzeProfileText(textToAnalyze, profileUrl);
      setAnalysisResult(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to extract profile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const res = await runDiscovery({
        reference_input_type: activeTab === 'url' ? 'url' : 'text',
        reference_text: rawText,
        reference_url: profileUrl,
        role_filter: roleFilter !== 'all' ? roleFilter : undefined,
        location_filter: locationFilter !== 'all' ? locationFilter : undefined,
        min_experience: minExp > 0 ? minExp : undefined,
        min_schools: minSchools > 1 ? minSchools : undefined,
        top_k: 25
      });
      onDiscoveryComplete(res);
    } catch (err: any) {
      alert('Discovery error: ' + err.message);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setIsUploadingCsv(true);
    setCsvUploadStatus(null);
    try {
      const result = await uploadProfilesCSV(csvFile);
      setCsvUploadStatus(`Successfully imported ${result.imported_count} profiles (${result.rejected_count} rejected).`);
    } catch (err: any) {
      setCsvUploadStatus(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 1 & 2: Reference Profile Ingestion & AI Analysis</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Candidate Discovery</h1>
        <p className="text-sm text-slate-500">
          Provide a reference education leader to discover and rank similar school influencers with traceable evidence.
        </p>
      </div>

      {/* Input Selection Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'text'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Profile Text / Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('persona')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'persona'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Select Test Persona</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Profile URL Reference</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'csv'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Batch CSV Ingestion</span>
          </button>
        </div>

        <div className="p-6">
          {/* Tab 1: Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Professional Bio / Profile Summary
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste candidate background, previous headships, advisory board seats, affiliated school network, and curriculum competencies..."
                  rows={5}
                  className="w-full text-sm p-4 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {rawText.length} characters entered
                </span>
                <button
                  onClick={() => handleAnalyzeText()}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAnalyzing ? 'Extracting Attributes...' : 'Extract & Validate Profile'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Test Personas */}
          {activeTab === 'persona' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose a preloaded reference profile to immediately test semantic retrieval and ranking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samplePersonas.map((persona, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPersona(persona)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600">{persona.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-600 transition">Select →</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{persona.role}</h4>
                      <p className="text-xs text-slate-500">{persona.org} • {persona.location}</p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{persona.bio}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {persona.skills.split(',').map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: URL Identifier */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Strict Data Ethics & Platform Compliance Policy</span>
                </div>
                <p>
                  In accordance with assignment guidelines, LinkedIn profile URLs are stored as external reference identifiers only. EduConnect AI does not bypass authentication, CAPTCHA, or platform restrictions. For full semantic feature matching, paste profile text in Tab 1.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  External Profile Reference URL
                </label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/referenced-school-leader"
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => handleAnalyzeText()}
                disabled={isAnalyzing || !profileUrl.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAnalyzing ? 'Processing Identifier...' : 'Register Profile Identifier'}</span>
              </button>
            </div>
          )}

          {/* Tab 4: CSV Import */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Upload a structured CSV with candidate education leaders to expand the authorized dataset:
              </p>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    {csvFile ? csvFile.name : 'Choose CSV file or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Required headers: name, role, organisation, location, experience_years, schools_count
                  </p>
                </label>
              </div>

              {csvFile && (
                <button
                  onClick={handleCsvUpload}
                  disabled={isUploadingCsv}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                >
                  {isUploadingCsv ? 'Validating & Importing...' : 'Validate & Import Records'}
                </button>
              )}

              {csvUploadStatus && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  {csvUploadStatus}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Analysis Preview (Pydantic Extracted Attributes with Editable Corrections) */}
      {analysisResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Extracted Professional Attributes</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {Math.round(analysisResult.confidence_score)}% Confidence
              </span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              ✏️ In-Place Editable Corrections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-slate-500 font-semibold block uppercase text-[10px]">Candidate Name</label>
              <input
                type="text"
                value={analysisResult.extracted_profile.name}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      name: e.target.value
                    }
                  })
                }
                className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2"
              />
              <label className="text-slate-500 font-semibold block uppercase text-[10px] mt-1">Role Title</label>
              <input
                type="text"
                value={analysisResult.extracted_profile.role}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      role: e.target.value
                    }
                  })
                }
                className="w-full text-xs font-medium text-blue-600 bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-slate-500 font-semibold block uppercase text-[10px]">Primary Institution</label>
              <input
                type="text"
                value={analysisResult.extracted_profile.organisation}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      organisation: e.target.value
                    }
                  })
                }
                className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2"
              />
              <label className="text-slate-500 font-semibold block uppercase text-[10px] mt-1">Location</label>
              <input
                type="text"
                value={analysisResult.extracted_profile.location}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      location: e.target.value
                    }
                  })
                }
                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-slate-500 font-semibold block uppercase text-[10px]">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={analysisResult.extracted_profile.experience_years}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      experience_years: Number(e.target.value)
                    }
                  })
                }
                className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2"
              />
              <label className="text-slate-500 font-semibold block uppercase text-[10px] mt-1">Schools Led / Advised</label>
              <input
                type="number"
                min="1"
                max="50"
                value={analysisResult.extracted_profile.schools_count || 1}
                onChange={(e) =>
                  setAnalysisResult({
                    ...analysisResult,
                    extracted_profile: {
                      ...analysisResult.extracted_profile,
                      schools_count: Number(e.target.value)
                    }
                  })
                }
                className="w-full text-xs font-bold text-emerald-700 bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>

          {/* Missing data disclosure */}
          {analysisResult.missing_fields.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Missing attributes ({analysisResult.missing_fields.join(', ')}) will be handled transparently using neutral renormalization without false negative penalties.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Discovery Configuration & Execution Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Stage 3 & 4: Retrieval & Ranking Constraints</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Target Role Category</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Roles (Principals, Directors, Trustees, etc.)</option>
              <option value="principal">Principals & Headmasters</option>
              <option value="director">Academic Directors & Leaders</option>
              <option value="consultant">School Turnaround Consultants</option>
              <option value="trustee">Trustees & Founders</option>
              <option value="edupreneur">K-12 Edupreneurs</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Region / Geographic Zone</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Locations (Global & India)</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="International">International (UK, UAE, Singapore)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Min Experience: {minExp} yrs</label>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Min Schools Footprint: {minSchools}+</label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={minSchools}
              onChange={(e) => setMinSchools(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunDiscovery}
            disabled={isDiscovering || (!rawText.trim() && !profileUrl.trim())}
            className="flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDiscovering ? 'Retrieving & Ranking Candidates...' : 'Run Discovery & Generate Ranking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

