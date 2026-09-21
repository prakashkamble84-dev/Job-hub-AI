/**
 * JobReady AI - Resume AI & ATS Analyzer (Phase 2)
 * Instant ATS score, section metrics, strength breakdown, and missing keyword highlights.
 */

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Upload,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import type { ResumeAnalysis } from '../types';
import { aiService } from '../services/aiService';
import { entitlementService } from '../services/entitlementService';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';
import { PaywallBanner } from './PremiumUpgradeModal';

export const DEFAULT_SAMPLE_RESUME = `ALEX MORGAN
Email: alex.morgan@example.com | Phone: (555) 234-5678 | Portfolio: github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 5+ years of experience designing and scaling production web applications using React, TypeScript, and modern state architectures. Proven expertise in optimizing Core Web Vitals, leading cross-functional teams, and implementing scalable design systems.

CORE COMPETENCIES
• Technical: TypeScript, React, Next.js, Node.js, GraphQL, Tailwind CSS, Jest, WebSockets
• Architecture: Micro-frontends, Component Libraries, CI/CD, Performance Optimization

EXPERIENCE
Lead Frontend Engineer | TechCorp Inc. (2022 - Present)
• Spearheaded frontend modernization to Next.js, reducing initial load latency by 42%.
• Mentored 6 software engineers and established rigorous TypeScript and testing standards.
• Collaborated closely with Product and UX teams to launch a flagship enterprise analytics dashboard.

Frontend Engineer | Digital Wave Solutions (2019 - 2022)
• Developed responsive UI components utilized by over 400,000 active users.
• Integrated REST and GraphQL endpoints with optimistic UI updates and robust offline cache.
• Increased unit test coverage from 45% to 88% using Jest and React Testing Library.

EDUCATION & CERTIFICATIONS
• B.S. in Computer Science - University of Technology
• AWS Certified Cloud Practitioner`;

interface ResumeAnalyzerProps {
  currentAnalysis: ResumeAnalysis | null;
  onAnalysisComplete: (analysis: ResumeAnalysis, rawText: string) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  currentAnalysis,
  onAnalysisComplete,
}) => {
  const { checkFeatureAccess, openUpgradeModal } = useSubscription();
  const [resumeText, setResumeText] = useState(DEFAULT_SAMPLE_RESUME);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(currentAnalysis);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;

    // Phase 9 Limit & Entitlement check
    const allowed = checkFeatureAccess(() => entitlementService.canUseResumeAnalysis());
    if (!allowed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeResume('user_active', resumeText);
      setAnalysis(result);
      entitlementService.recordResumeAnalysis();
      analyticsService.trackResumeAnalyzed(result.overallScore);
      onAnalysisComplete(result, resumeText);
    } catch (err: any) {
      setError(err.message || 'AI service is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySample = () => {
    setResumeText(DEFAULT_SAMPLE_RESUME);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usageStatus = entitlementService.canUseResumeAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>AI Resume Analyzer</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Get immediate ATS compatibility scoring, keyword detection, and actionable impact improvements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-600 border border-slate-200">
            {usageStatus.isUnlimited
              ? 'Unlimited Analyses (Premium)'
              : `${usageStatus.remaining} of ${usageStatus.limit} free left this month`}
          </span>
        </div>
      </div>

      {!usageStatus.isUnlimited && usageStatus.remaining === 0 && (
        <PaywallBanner featureName="Resume Analyzer" onUpgrade={() => openUpgradeModal('resume_analyzer_limit')} />
      )}

      {/* Input Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Resume Content (Paste Text)
          </label>
          <button
            onClick={copySample}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Sample loaded' : 'Load sample resume'}</span>
          </button>
        </div>

        <textarea
          rows={8}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste full resume text here..."
          className="w-full p-3.5 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            disabled={loading || !resumeText.trim()}
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing ATS Quality...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Resume Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-blue-600 text-white col-span-2 sm:col-span-1 shadow-sm flex flex-col justify-between">
              <div className="text-xs font-semibold text-blue-100">Overall ATS Score</div>
              <div className="text-4xl font-extrabold my-2">{analysis.overallScore}</div>
              <div className="text-[11px] text-blue-200">Out of 100 benchmark</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">ATS Formatting</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analysis.atsCompatibilityScore}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.atsCompatibilityScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Impact &amp; Metrics</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analysis.impactScore}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${analysis.impactScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Structure &amp; Flow</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analysis.structureScore}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${analysis.structureScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Skill Alignment</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analysis.skillsScore}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${analysis.skillsScore}%` }} />
              </div>
            </div>
          </div>

          {/* Summary Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Executive Summary: </span>
            {analysis.summary}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Strengths Detected</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>High-Impact Recommendations</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keywords Detected vs Missing */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Keywords &amp; Competencies</h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-emerald-800">Detected Keywords:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {analysis.keywordsDetected.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-rose-800">Recommended Missing Keywords:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
