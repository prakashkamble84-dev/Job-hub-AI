/**
 * JobReady AI - Play Store & Production Launch Readiness Modal
 * Complete checklist of Google Play compliance, store listings, screenshot specifications, and security audits.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  FileCheck,
  Smartphone,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const PlayStoreReadinessModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'checklist' | 'store_listing' | 'screenshots' | 'compliance'>('checklist');

  const checklistItems = [
    { label: 'Authentication & Session Isolation', status: 'Ready', desc: 'Secure UID isolation across all collections.' },
    { label: 'Free Plan & Usage Gateways', status: 'Ready', desc: 'Strict remote-configured monthly usage limits.' },
    { label: 'Google Play Billing Architecture', status: 'Ready', desc: 'Server verification endpoints for purchase tokens.' },
    { label: 'Privacy Center & Data Export', status: 'Ready', desc: '1-click JSON archive export of all user data.' },
    { label: 'Permanent Account Deletion Flow', status: 'Ready', desc: 'Complete purge of user profile, resumes & auth.' },
    { label: 'Crash & Telemetry Architecture', status: 'Ready', desc: 'Sanitized error reporting with no private tokens.' },
    { label: 'Offline Detection & State Resilience', status: 'Ready', desc: 'Graceful offline notice and local cache.' },
    { label: 'AI Cost Controls & Backoff', status: 'Ready', desc: 'Max 2 retries, caching, token usage tracking.' },
    { label: 'No Misleading Employment Guarantees', status: 'Ready', desc: 'Compliant copy across store, paywall & terms.' },
  ];

  const screenshots = [
    { title: '1. AI Resume Analysis', caption: 'Instant ATS scoring, keyword detection & impact breakdown' },
    { title: '2. Targeted Resume Tailoring', caption: 'Align experience to job descriptions with one tap' },
    { title: '3. AI Interview Coach', caption: 'Realistic STAR feedback & role-based question simulations' },
    { title: '4. Smart Job Discovery', caption: 'Curated recommendations & automated job alerts' },
    { title: '5. Application Tracker', caption: 'Visual pipeline with follow-up task reminders' },
    { title: '6. Daily Career Dashboard', caption: 'Daily action plans & proactive readiness score' },
    { title: '7. JobReady Premium', caption: 'Unlimited AI tailoring, interview coach & insights' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">Google Play Store &amp; Production Readiness</h3>
              <p className="text-xs text-emerald-200">Phase 9 Launch Validation • JobReady AI v1.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('checklist')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeSection === 'checklist'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Production Checklist
          </button>
          <button
            onClick={() => setActiveSection('store_listing')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeSection === 'store_listing'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Store Listing Copy
          </button>
          <button
            onClick={() => setActiveSection('screenshots')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeSection === 'screenshots'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Screenshot Concepts
          </button>
          <button
            onClick={() => setActiveSection('compliance')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeSection === 'compliance'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Safety &amp; Disclaimers
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSection === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Pre-Launch Verification Items</h4>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  9 / 9 Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklistItems.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'store_listing' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div>
                  <span className="font-bold text-slate-700">App Name (30 chars max):</span>
                  <div className="font-mono text-sm font-semibold text-slate-900 mt-0.5">JobReady AI</div>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Short Description (80 chars max):</span>
                  <div className="font-mono text-sm text-slate-800 mt-0.5">
                    AI-powered career, resume, job search and interview assistant.
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Full Description:</span>
                  <div className="mt-1 p-3 bg-white rounded-lg border border-slate-200 text-slate-700 font-sans leading-relaxed space-y-2">
                    <p>
                      <strong>JobReady AI</strong> is your comprehensive career companion designed to streamline your job search from application to offer.
                    </p>
                    <p>
                      <strong>Key Features:</strong><br />
                      • <strong>AI Resume Analyzer:</strong> Instant ATS compatibility scoring, keyword optimization, and impact metrics.<br />
                      • <strong>Targeted Resume Tailoring:</strong> Align your experience with specific job descriptions while maintaining accuracy.<br />
                      • <strong>AI Interview Coach:</strong> Interactive voice and text simulations with real-time STAR feedback.<br />
                      • <strong>Smart Job Discovery:</strong> Curated recommendations matching your target role and custom job alerts.<br />
                      • <strong>Application Pipeline:</strong> Organize applications from Wishlist to Offer with automated follow-ups.<br />
                      • <strong>Daily Career Plan:</strong> Stay focused with prioritized daily action items and progress analytics.
                    </p>
                    <p className="text-slate-500 italic">
                      Disclaimer: JobReady AI helps prepare materials and practice skills. It does not guarantee employment or salary outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'screenshots' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Play Store Visual Mockup Plan (16:9 / 9:16)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {screenshots.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{s.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Google Play Data Safety Section</h4>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Data Collected:</strong> Name, email, user-uploaded resumes, job application records.<br />
                  • <strong>Data Security:</strong> Encrypted in transit (HTTPS/TLS) and isolated by Firebase Auth UID.<br />
                  • <strong>Data Deletion Request:</strong> Fully compliant self-service 1-click account purge available in app settings.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Runtime Permissions Manifest</h4>
                <p className="text-slate-600 leading-relaxed">
                  • <code>RECORD_AUDIO</code>: Genuinely requested only when practicing voice mock interviews.<br />
                  • <code>INTERNET</code>: Required for server-side AI processing and billing validation.<br />
                  • <strong>No Unnecessary Permissions:</strong> Contacts, SMS, and exact location are NOT requested.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
