import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Network,
  BarChart3,
  CheckCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);

  const chapters = [
    {
      title: '1. Problem Statement & EduConnect AI Introduction',
      duration: '0:00 – 1:00',
      subtitle: 'Finding the right people. Building the right school network.',
      narration:
        'Welcome to EduConnect AI, an AI-powered school influencer discovery MVP for the EDXSO AI Intern Assignment. Finding school leaders, turnaround consultants, and trustees often relies on illegal web scraping or keyword matching. EduConnect AI introduces explainable semantic matching over authorized, traceable datasets.',
      content: (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">EduConnect AI</h3>
          <p className="text-xs text-blue-200 max-w-lg mx-auto leading-relaxed">
            AI-powered school influencer discovery platform that analyses reference profiles, discovers similar education professionals, and ranks them using semantic similarity, professional experience, and school ecosystem relevance.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="font-bold text-white block">30 Curated</span>
              <span className="text-[10px] text-slate-400">Verified Profiles</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="font-bold text-emerald-400 block">5-Signal</span>
              <span className="text-[10px] text-slate-400">Hybrid Formula</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              <span className="font-bold text-indigo-400 block">100% Traceable</span>
              <span className="text-[10px] text-slate-400">Zero Scraping</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '2. Reference Profile Ingestion & Pydantic AI Extraction',
      duration: '1:00 – 2:30',
      subtitle: 'Structured feature parsing without hallucinations or fake data.',
      narration:
        'Stage 1 and 2 accept unstructured bio text, external profile identifiers, or preloaded personas. Pydantic validates structured fields: years of experience, leadership seniority, school footprint, and skills. Missing fields remain Not Available, preventing false data generation.',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-700">
            <span>Input: "Dr. Rajesh K. Sharma, Senior Advisor with 24 yrs exp leading 18+ CBSE branches..."</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Pydantic Validated</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Extracted Role</span>
              <p className="font-bold text-white mt-1">Senior Educational Advisor</p>
              <p className="text-[11px] text-blue-400">Category: Director</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Verified Tenure</span>
              <p className="font-bold text-white mt-1">24 Years Experience</p>
              <p className="text-[11px] text-emerald-400">18+ Campuses Led</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Audited Evidence</span>
              <p className="font-bold text-white mt-1">CBSE Reforms Advisor</p>
              <p className="text-[11px] text-slate-400 truncate">Source: edlead-advisory.org</p>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-900/30 border border-blue-500/30 text-[11px] text-blue-200">
            💡 Editable In-Place: Recruiters can adjust parsed attributes prior to candidate pool execution.
          </div>
        </div>
      )
    },
    {
      title: '3. Sentence Transformers & 5-Signal Hybrid Re-Ranking',
      duration: '2:30 – 4:30',
      subtitle: 'Final Score = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L',
      narration:
        'Candidate retrieval combines all-MiniLM-L6-v2 dense vector embeddings with our deterministic hybrid scoring formula. Re-ranking balances semantic similarity at 45 percent, role family at 20 percent, education indicators at 15 percent, network footprint at 10 percent, and regional proximity at 10 percent.',
      content: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-center font-mono text-xs text-indigo-300 font-bold">
            Final Score = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>S — Semantic Similarity (Dense Vector Cosine)</span>
              <span className="font-bold text-indigo-400">45%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[45%]"></div>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>R — Role Family & Seniority Match</span>
              <span className="font-bold text-blue-400">20%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[20%]"></div>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>E — School Education Relevance (CBSE/ICSE/IB)</span>
              <span className="font-bold text-emerald-400">15%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[15%]"></div>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>N — Multi-School Network Exposure</span>
              <span className="font-bold text-amber-400">10%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[10%]"></div>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>L — Location & Regional Proximity</span>
              <span className="font-bold text-purple-400">10%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[10%]"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '4. Candidate Results & PeopleGPT Style Dossier',
      duration: '4:30 – 6:00',
      subtitle: 'Top AI Pick highlight, traceable evidence quotes, and shortlisting.',
      narration:
        'The Results interface highlights the Top AI Pick with highest match confidence, followed by candidate cards or tables. Each profile features an AI Spotlight explaining why they match, score breakdown tooltips, and a slide-out dossier with verified evidence quotes.',
      content: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white">
                MN
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300">Top AI Pick</span>
                <p className="font-bold text-white">Meera Nambiar</p>
                <p className="text-[11px] text-blue-200">Former Principal & School Turnaround Consultant</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs">
              91% Match
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase">AI Spotlight Explanation:</span>
            <p className="italic text-slate-200">
              "Meera Nambiar shows direct leadership alignment as Former Principal, and active advisory across 12 school institutions with 19 years of verified educational administration experience."
            </p>
          </div>
        </div>
      )
    },
    {
      title: '5. Institutional Network Map & Visual Graph',
      duration: '6:00 – 7:00',
      subtitle: 'Visualizing multi-school clusters, advisory boards, and summit connections.',
      narration:
        'Clicking Network Map opens an interactive graph inspired by modern intelligence dashboards. It maps candidate relationships across CBSE curriculum taskforces, partner school clusters, academic summits, and peer turnaround mentors.',
      content: (
        <div className="relative h-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-400 bg-slate-800 mx-auto flex items-center justify-center text-white font-bold text-sm shadow-xl">
              Leader
            </div>
            <p className="text-xs font-bold text-white mt-1">Meera Nambiar</p>
          </div>
          <div className="absolute left-6 top-4 bg-slate-800 border border-indigo-500/30 px-2 py-1 rounded text-[10px] text-indigo-300">
            🏢 CBSE Advisory Council
          </div>
          <div className="absolute right-6 top-4 bg-slate-800 border border-emerald-500/30 px-2 py-1 rounded text-[10px] text-emerald-300">
            🏆 GIIS 12+ School Cluster
          </div>
          <div className="absolute left-6 bottom-4 bg-slate-800 border border-purple-500/30 px-2 py-1 rounded text-[10px] text-purple-300">
            👥 Turnaround Mentors
          </div>
          <div className="absolute right-6 bottom-4 bg-slate-800 border border-amber-500/30 px-2 py-1 rounded text-[10px] text-amber-300">
            🎤 Bett Asia Keynote
          </div>
        </div>
      )
    },
    {
      title: '6. Network Analytics, Data Ethics & 100% Verification',
      duration: '7:00 – 8:30',
      subtitle: 'Complete compliance with zero LinkedIn scraping and 100% Pytest pass.',
      narration:
        'In Network Analytics, interactive Recharts display role distributions, geographic clusters, and score bands. The Settings tab allows adjusting weights dynamically. All 6 Pytest unit tests pass, confirming deterministic scoring and production readiness.',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Section 6 Compliance</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                No unauthorized LinkedIn scraping, no CAPTCHA bypass. Purely authorized registries and public institutional pages.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Automated Test Suite</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                6 passed unit tests covering API health, dynamic metrics, Pydantic schemas, and mathematical ranking weights.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center text-xs text-slate-300">
            <span className="text-emerald-400 font-bold">✓ Production Ready:</span> React + TypeScript Frontend · FastAPI Backend · SQLite/Supabase + pgvector
          </div>
        </div>
      )
    }
  ];

  // Speech synthesis narrator
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    if (voiceEnabled && isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = chapters[currentChapter].narration;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        // Auto advance chapter
        if (currentChapter < chapters.length - 1) {
          setTimeout(() => setCurrentChapter((prev) => prev + 1), 1000);
        } else {
          setIsPlaying(false);
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentChapter, voiceEnabled, isPlaying, isOpen]);

  if (!isOpen) return null;

  const current = chapters[currentChapter];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B132B] text-white rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-4xl overflow-hidden flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">EduConnect AI — Official Demo Walkthrough</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  LIVE VIDEO MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Chapter {currentChapter + 1} of {chapters.length} • {current.duration}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Mute AI Narrator' : 'Enable AI Narrator'}
              className={`p-2 rounded-lg border transition ${
                voiceEnabled
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Screen */}
        <div className="p-8 min-h-[380px] flex flex-col justify-between relative bg-gradient-to-b from-[#0B132B] to-[#1C2541]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {current.duration}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Slide {currentChapter + 1} / {chapters.length}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{current.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-6">{current.subtitle}</p>

            {/* Visual Content Box */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-inner">
              {current.content}
            </div>
          </div>

          {/* Subtitles / Narrator Transcript Bar */}
          <div className="mt-6 p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
            <span className="text-[10px] uppercase font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 shrink-0">
              Narrator
            </span>
            <p className="italic text-slate-200 leading-relaxed font-sans">{current.narration}</p>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setCurrentChapter((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentChapter === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1));
              }}
              disabled={currentChapter === chapters.length - 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setCurrentChapter(0);
                setIsPlaying(true);
              }}
              title="Restart from beginning"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Chapter Timeline Indicator */}
          <div className="flex items-center space-x-1.5">
            {chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setCurrentChapter(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentChapter
                    ? 'w-6 bg-blue-500'
                    : idx < currentChapter
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to Chapter ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
