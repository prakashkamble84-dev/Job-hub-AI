/**
 * JobReady AI - Job Description Analyzer & Resume Tailoring (Phases 3 & 4)
 * Matches job postings, identifies skill gaps, and generates targeted resume versions.
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import type { JobAnalysis, ResumeVersion } from '../types';
import { aiService } from '../services/aiService';
import { entitlementService } from '../services/entitlementService';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';
import { PaywallBanner } from './PremiumUpgradeModal';
import { DEFAULT_SAMPLE_RESUME } from './ResumeAnalyzer';

const SAMPLE_JOB_DESC = `We are seeking a Senior Frontend Engineer to lead user-facing web applications.
Responsibilities:
- Build high-performance, accessible frontend interfaces with React, TypeScript, and modern CSS.
- Partner with product managers, UX designers, and backend engineers on micro-frontend systems.
- Optimize frontend web performance, telemetry, and automated end-to-end testing.

Requirements:
- 4+ years of professional web application engineering.
- Deep expertise in TypeScript, React, Next.js, and State Architecture.
- Experience with Docker, CI/CD pipelines, and cloud deployments.
- Strong analytical and problem-solving skills.`;

export const JobAnalyzer: React.FC = () => {
  const { checkFeatureAccess, openUpgradeModal } = useSubscription();

  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [companyName, setCompanyName] = useState('Linear');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESC);
  const [resumeText, setResumeText] = useState(DEFAULT_SAMPLE_RESUME);

  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredVersion, setTailoredVersion] = useState<ResumeVersion | null>(null);

  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [tailoringResume, setTailoringResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) return;

    const allowed = checkFeatureAccess(() => entitlementService.canAnalyzeJob());
    if (!allowed) return;

    setAnalyzingJob(true);
    setError(null);

    try {
      const result = await aiService.analyzeJob({
        uid: 'user_active',
        jobTitle,
        company: companyName,
        jobDescription,
      });
      setJobAnalysis(result);
      entitlementService.recordJobAnalysis();
    } catch (err: any) {
      setError(err.message || 'AI service is temporarily unavailable.');
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleTailorResume = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) return;

    const allowed = checkFeatureAccess(() => entitlementService.canTailorResume());
    if (!allowed) return;

    setTailoringResume(true);
    setError(null);

    try {
      const result = await aiService.tailorResume({
        uid: 'user_active',
        resumeText,
        jobTitle,
        companyName,
        jobDescription,
      });

      const version: ResumeVersion = {
        id: `ver_${Date.now()}`,
        uid: 'user_active',
        resumeId: 'res_default',
        jobTitle,
        companyName,
        tailoredContent: result.tailoredContent,
        tailoredSummary: result.tailoredSummary,
        matchScore: result.matchScore,
        changesSummary: result.changesSummary,
        createdAt: new Date().toISOString(),
      };

      setTailoredVersion(version);
      entitlementService.recordResumeTailoring();
      analyticsService.trackResumeTailored(result.matchScore);
    } catch (err: any) {
      setError(err.message || 'AI service is temporarily unavailable.');
    } finally {
      setTailoringResume(false);
    }
  };

  const downloadTailoredText = () => {
    if (!tailoredVersion) return;
    const element = document.createElement('a');
    const file = new Blob([tailoredVersion.tailoredContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Tailored_Resume_${companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyTailored = () => {
    if (!tailoredVersion) return;
    navigator.clipboard.writeText(tailoredVersion.tailoredContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tailorUsage = entitlementService.canTailorResume();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span>Job Match &amp; AI Resume Tailor</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare your profile against any job description and generate tailored bullet points.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-600 border border-slate-200">
          {tailorUsage.isUnlimited
            ? 'Unlimited Tailoring (Premium)'
            : `${tailorUsage.remaining} of ${tailorUsage.limit} tailoring runs left`}
        </span>
      </div>

      {!tailorUsage.isUnlimited && tailorUsage.remaining === 0 && (
        <PaywallBanner featureName="Resume Tailoring" onUpgrade={() => openUpgradeModal('tailor_limit')} />
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Target Job Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Target Job Posting</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Job Title"
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name"
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <textarea
            rows={7}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description..."
            className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
          />

          <div className="flex justify-between items-center pt-1">
            <button
              disabled={analyzingJob || !jobDescription.trim()}
              onClick={handleAnalyzeJob}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {analyzingJob ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>Analyze Skill Gaps</span>
            </button>
          </div>
        </div>

        {/* Right: Candidate Resume Context */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Candidate Experience Base</h3>
            <span className="text-[11px] text-slate-400">Current active resume</span>
          </div>

          <textarea
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste base resume text..."
            className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
          />

          <div className="flex justify-end pt-1">
            <button
              disabled={tailoringResume || !resumeText.trim() || !jobDescription.trim()}
              onClick={handleTailorResume}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {tailoringResume ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tailoring Resume AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Tailor Resume for this Job</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Skill Gap Analysis Result */}
      {jobAnalysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Job Match &amp; Skill Gap Analysis ({jobTitle} @ {companyName})
              </h3>
              <p className="text-xs text-slate-500">Comparison of your background with job requirements</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Match Score</span>
              <div className="text-2xl font-extrabold text-blue-600">{jobAnalysis.matchScore}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Matching Core Skills</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {jobAnalysis.skillsMatch.matching.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white text-emerald-800 text-[11px] font-medium border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Missing Requirements</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {jobAnalysis.skillsMatch.missing.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white text-rose-800 text-[11px] font-medium border border-rose-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Recommendations</span>
              </div>
              <ul className="text-[11px] text-amber-900 space-y-1 mt-2">
                {jobAnalysis.recommendations.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tailored Resume Result */}
      {tailoredVersion && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Tailored Version Ready</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Optimized for {tailoredVersion.jobTitle} at {tailoredVersion.companyName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyTailored}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadTailoredText}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (.txt / PDF)</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
            <span className="font-bold">Tailored Summary: </span>
            {tailoredVersion.tailoredSummary}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Changes Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tailoredVersion.changesSummary.map((c, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  ✓ {c}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tailored Document Preview</h4>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80">
              {tailoredVersion.tailoredContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
