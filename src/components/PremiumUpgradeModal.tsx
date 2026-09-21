/**
 * JobReady AI - Premium Upgrade Modal & Multi-Role Paywall
 * Transparent pricing for both Candidates (Pro Career) and Employers (Recruiter AI & WhatsApp Match).
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Bot,
  FileText,
  Briefcase,
  Bell,
  RefreshCw,
  AlertCircle,
  Building,
  User,
  MessageCircle,
  Users,
  Check,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceReason?: string;
  initialRole?: UserRole;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  sourceReason,
  initialRole,
}) => {
  const { role } = useAuth();
  const { purchaseProduct, restorePurchases, loading, isPremium } = useSubscription();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(
    initialRole || (sourceReason?.includes('employer') ? 'employer' : role || 'candidate')
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(
    activeRoleTab === 'employer' ? 'jobready_employer_growth' : 'jobready_premium_yearly'
  );

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeRoleTab === 'employer') {
      setSelectedProductId('jobready_employer_growth');
    } else {
      setSelectedProductId('jobready_premium_yearly');
    }
  }, [activeRoleTab]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setFeedbackMsg(null);
    const res = await purchaseProduct(selectedProductId);
    if (res.success) {
      setFeedbackMsg({
        text: activeRoleTab === 'employer'
          ? 'Employer Plan activated! You can now post openings and match candidates via WhatsApp.'
          : 'Welcome to Candidate Pro! All career limits unlocked.',
        type: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setFeedbackMsg({ text: res.error || 'Payment was cancelled or failed.', type: 'error' });
    }
  };

  const handleRestore = async () => {
    setFeedbackMsg(null);
    const res = await restorePurchases();
    if (res.success) {
      setFeedbackMsg({ text: 'Purchases restored successfully! Subscription is active.', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedbackMsg({ text: res.error || 'No active purchase found to restore.', type: 'error' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 text-white p-6 sm:p-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sky-200 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>JobReady AI Plans & Pricing</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeRoleTab === 'employer' ? 'Scale Your Tech Hiring with AI' : 'Land Your Dream Career with AI'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 max-w-xl">
              {activeRoleTab === 'employer'
                ? 'Automated candidate matching, skill gap analysis, and 1-click WhatsApp recruiter invitations.'
                : 'Unlimited Gemini live voice interviews, resume tailoring, and real-time recruiter WhatsApp outreach.'}
            </p>

            {/* Candidate vs Employer Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 max-w-md">
              <button
                type="button"
                onClick={() => setActiveRoleTab('candidate')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleTab === 'candidate'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate / Job Seeker Plans</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRoleTab('employer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleTab === 'employer'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Employer / Recruiter Plans</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Feedback Alert */}
            {feedbackMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* CANDIDATE PLANS */}
            {activeRoleTab === 'candidate' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Yearly Card */}
                  <div
                    onClick={() => setSelectedProductId('jobready_premium_yearly')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      selectedProductId === 'jobready_premium_yearly'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/30 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Save 58%
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Candidate Pro Yearly</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedProductId === 'jobready_premium_yearly'
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selectedProductId === 'jobready_premium_yearly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">₹999 / year</div>
                    <div className="text-xs text-slate-500 mt-0.5">₹83/mo • VIP Recruiter Priority Badge</div>
                  </div>

                  {/* Monthly Card */}
                  <div
                    onClick={() => setSelectedProductId('jobready_premium_monthly')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      selectedProductId === 'jobready_premium_monthly'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/30 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Candidate Pro Monthly</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedProductId === 'jobready_premium_monthly'
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selectedProductId === 'jobready_premium_monthly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">₹199 / month</div>
                    <div className="text-xs text-slate-500 mt-0.5">Billed monthly • Cancel anytime</div>
                  </div>
                </div>

                {/* Feature breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">Candidate Pro Includes:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unlimited AI Resume Tailoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unlimited Voice Mock Interviews</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instant Recruiter WhatsApp Match Alerts</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Search & Maps Salary Grounding</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMPLOYER PLANS */}
            {activeRoleTab === 'employer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Employer Growth */}
                  <div
                    onClick={() => setSelectedProductId('jobready_employer_growth')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      selectedProductId === 'jobready_employer_growth'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Popular Recruiter Plan
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Recruiter Growth & AI Match</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedProductId === 'jobready_employer_growth'
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selectedProductId === 'jobready_employer_growth' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">₹1,499 / month</div>
                    <div className="text-xs text-slate-500 mt-0.5">Post 25 Openings • Direct WhatsApp Dispatch</div>
                  </div>

                  {/* Employer Enterprise */}
                  <div
                    onClick={() => setSelectedProductId('jobready_employer_enterprise')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      selectedProductId === 'jobready_employer_enterprise'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Recruiter Enterprise</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedProductId === 'jobready_employer_enterprise'
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selectedProductId === 'jobready_employer_enterprise' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">₹4,999 / month</div>
                    <div className="text-xs text-slate-500 mt-0.5">Unlimited Openings • Automated WhatsApp Broadcasts</div>
                  </div>
                </div>

                {/* Employer Features */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2 text-xs">
                  <div className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Employer Plan Highlights:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gemini AI Candidate Rank & Skill Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1-Click Direct WhatsApp Alerts (`wa.me`)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Full Access to Verified Talent Pool</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Custom WhatsApp Message Templates</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer & Trust Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Secure payment processing. Subscriptions can be managed or cancelled anytime.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={loading}
                onClick={handlePurchase}
                className={`flex-1 py-3 px-5 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                  activeRoleTab === 'employer'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Subscription...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {activeRoleTab === 'employer' ? 'Activate Employer Plan' : 'Start Candidate Pro'}
                    </span>
                  </>
                )}
              </button>

              <button
                disabled={loading}
                onClick={handleRestore}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore Purchase</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const PaywallBanner: React.FC<{ featureName: string; onUpgrade: () => void }> = ({
  featureName,
  onUpgrade,
}) => {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-blue-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Premium Feature</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {featureName} is included with JobReady Premium with expanded monthly limits.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUpgrade}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          View Premium
        </button>
      </div>
    </div>
  );
};

