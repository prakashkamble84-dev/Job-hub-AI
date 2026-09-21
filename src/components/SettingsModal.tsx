/**
 * JobReady AI - Centralized Settings & Privacy Center Modal
 * Handles Account, Subscription, Privacy, Notifications, Data Export, Deletion, Support & Feedback.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  CreditCard,
  Shield,
  Bell,
  Download,
  Trash2,
  HelpCircle,
  MessageSquareHeart,
  Info,
  Check,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Send,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { dataExportService } from '../services/dataExportService';
import { subscriptionService } from '../services/subscriptionService';
import { analyticsService } from '../services/analyticsService';
import type { FeedbackCategory } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'account' | 'subscription' | 'privacy' | 'notifications' | 'data' | 'support' | 'feedback' | 'about';
  allUserDataForExport: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'account',
  allUserDataForExport,
}) => {
  const {
    user,
    updateProfile,
    logout,
    notificationSettings,
    updateNotificationSettings,
    privacyPreferences,
    updatePrivacyPreferences,
  } = useAuth();
  const { entitlement, isPremium, openUpgradeModal, restorePurchases, loading } = useSubscription();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Account Edit State
  const [name, setName] = useState(user?.displayName || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [preferredLocation, setPreferredLocation] = useState(user?.preferredLocation || '');
  const [salaryMin, setSalaryMin] = useState(user?.targetSalaryMin || 100000);
  const [salaryMax, setSalaryMax] = useState(user?.targetSalaryMax || 150000);
  const [employmentType, setEmploymentType] = useState(user?.employmentType || 'Full-time');

  // Delete Account Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputConfirm, setDeleteInputConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Form State
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('Suggestion');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Support Form State
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  if (!isOpen) return null;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: name,
      targetRole,
      preferredLocation,
      targetSalaryMin: Number(salaryMin),
      targetSalaryMax: Number(salaryMax),
      employmentType: employmentType as any,
    });
    setSaveMessage('Profile settings updated successfully.');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleExportData = async () => {
    if (!user) return;
    await dataExportService.exportUserData(user.uid, allUserDataForExport);
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteInputConfirm.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    analyticsService.trackAccountDeleted();
    await dataExportService.deleteUserAccount(user.uid);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    logout();
    onClose();
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          category: feedbackCategory,
          message: feedbackMessage,
          rating: feedbackRating,
        }),
      });
      setFeedbackSent(true);
      setFeedbackMessage('');
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSupportSent(true);
    setSupportMessage('');
    setTimeout(() => setSupportSent(false), 3000);
  };

  const cancelInfo = subscriptionService.cancelSubscriptionInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto">
          <div className="space-y-1 w-full flex md:flex-col gap-1 md:gap-0">
            <div className="hidden md:block px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Settings & Privacy
            </div>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'subscription'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Subscription</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Privacy Center</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Data & Privacy</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Help & Support</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'feedback'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4 shrink-0" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>About & Terms</span>
            </button>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-200 text-xs text-slate-400">
            <div>JobReady AI v1.0.0</div>
            <div>Build 100</div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {saveMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* TAB: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Career & Account Profile</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your personal target roles, locations, and compensation targets.
                </p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
                    <input
                      type="text"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      placeholder="e.g. Remote, Bangalore, San Francisco"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Min Target Salary ($)</label>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Target Salary ($)</label>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Subscription & Billing</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your plan tier, renew options, or restore existing Google Play purchases.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Plan</div>
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                      <span>{isPremium ? 'JobReady Premium' : 'JobReady Free Tier'}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          isPremium ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {entitlement?.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {!isPremium ? (
                    <button
                      onClick={() => openUpgradeModal('settings_tab')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Upgrade to Premium</span>
                    </button>
                  ) : (
                    <div className="text-right text-xs text-slate-500">
                      <div>Auto-Renewing: {entitlement?.autoRenewing ? 'Yes' : 'No'}</div>
                      <div>Expiry: {entitlement?.expiryDate ? new Date(entitlement.expiryDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-3 text-xs text-slate-600 space-y-1">
                  <p>{cancelInfo.message}</p>
                  <a
                    href={cancelInfo.manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                  >
                    <span>Manage Subscription in Google Play</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  disabled={loading}
                  onClick={() => restorePurchases()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore Google Play Purchases</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PRIVACY CENTER */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Privacy Center</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We believe in total transparency. Here is how your data is protected.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">What data JobReady stores</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We store your career profile, uploaded resumes, generated tailoring versions, interview practice logs, and saved jobs exclusively tied to your authenticated UID.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">How AI processing works</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When you analyze a resume or practice an interview, text is processed securely server-side using Google Gemini models. We never sell your resume text or training data to third-party ad networks.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Job Search & Analytics</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Job matching calculations compare your target skills with current market postings. Telemetry captures anonymous funnel usage to improve app stability without logging sensitive private documents.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Privacy Preferences</h4>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Anonymous Telemetry & Analytics</div>
                    <div className="text-[11px] text-slate-500">Help us improve crash-free rates and AI performance.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyPreferences.shareAnalytics}
                    onChange={(e) => updatePrivacyPreferences({ shareAnalytics: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Crash & Error Telemetry</div>
                    <div className="text-[11px] text-slate-500">Send anonymized error stack traces to our engineering monitor.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyPreferences.crashReportingConsent}
                    onChange={(e) => updatePrivacyPreferences({ crashReportingConsent: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose which alerts and proactive career reminders you want to receive.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Daily Career Plan</div>
                    <div className="text-xs text-slate-500">Receive morning focus actions and readiness updates.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailyPlan}
                    onChange={(e) => updateNotificationSettings({ dailyPlan: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Interview Reminders</div>
                    <div className="text-xs text-slate-500">Reminders for scheduled mock sessions and weak-area drills.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.interviewReminders}
                    onChange={(e) => updateNotificationSettings({ interviewReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Application Follow-up Reminders</div>
                    <div className="text-xs text-slate-500">Prompts when pending applications reach their follow-up target date.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.followUpReminders}
                    onChange={(e) => updateNotificationSettings({ followUpReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Job Alerts</div>
                    <div className="text-xs text-slate-500">Notifications when matching jobs are posted by top employers.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.jobAlerts}
                    onChange={(e) => updateNotificationSettings({ jobAlerts: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Weekly Career Summary</div>
                    <div className="text-xs text-slate-500">A weekly review of applications submitted, practice scores, and career progress.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklySummary}
                    onChange={(e) => updateNotificationSettings({ weeklySummary: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB: DATA & PRIVACY */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Data Management</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Export your complete personal data archive or request permanent account deletion.
                </p>
              </div>

              {/* Export Box */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Download My Data</h4>
                    <p className="text-xs text-slate-600">
                      Export a full JSON file containing your career profile, resumes, tailored versions, job analyses, application pipeline, and interview history.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Generate & Download JSON Archive</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950">Delete JobReady Account</h4>
                    <p className="text-xs text-rose-700">
                      Permanently erase your account, career profile, uploaded documents, tailored resumes, and all associated cloud records. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-rose-300 space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Type "DELETE" to confirm permanent deletion:</span>
                    </div>
                    <input
                      type="text"
                      value={deleteInputConfirm}
                      onChange={(e) => setDeleteInputConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        disabled={deleteInputConfirm.trim().toUpperCase() !== 'DELETE' || isDeleting}
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors"
                      >
                        {isDeleting ? 'Deleting data...' : 'Permanently Delete Everything'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteInputConfirm('');
                        }}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Help & Support</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Find answers to common questions or reach our support team.
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-2">
                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group">
                  <summary className="font-semibold text-xs text-slate-800 cursor-pointer list-none flex items-center justify-between">
                    <span>How does the AI Resume Analysis calculate ATS score?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Our analyzer evaluates standard ATS criteria: parseable typography, chronological structure, quantified achievement metrics, and keyword match density against industry benchmarks.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group">
                  <summary className="font-semibold text-xs text-slate-800 cursor-pointer list-none flex items-center justify-between">
                    <span>How do I cancel my Google Play subscription?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Open the Google Play Store app, tap your profile icon &gt; Payments &amp; subscriptions &gt; Subscriptions &gt; JobReady AI, then tap "Cancel Subscription". You will retain premium access through the end of your billing cycle.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group">
                  <summary className="font-semibold text-xs text-slate-800 cursor-pointer list-none flex items-center justify-between">
                    <span>Are interview practice sessions recorded or saved?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Only your evaluation reports and feedback scores are saved to your account history for progress tracking. Raw microphone audio streams are processed in real time and discarded immediately.
                  </p>
                </details>
              </div>

              {/* Contact Support */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Contact Support</h4>
                <p className="text-xs text-slate-600">Have an issue with your account or billing? Send our support team a direct message.</p>

                {supportSent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Your support ticket has been received. Our team typically responds within 24 hours.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendSupport} className="space-y-3">
                    <textarea
                      rows={3}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe the issue you encountered..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Support Ticket</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Send App Feedback</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tell us what you love or what we should improve in upcoming releases.
                </p>
              </div>

              {feedbackSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Thank you for helping us make JobReady AI better! Your feedback is noted.</span>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Feature request', 'Bug', 'Suggestion', 'Other'] as FeedbackCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                            feedbackCategory === cat
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your thoughts, suggested features, or bug reports..."
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB: ABOUT & TERMS */}
          {activeTab === 'about' && (
            <div className="space-y-6 text-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900">About JobReady AI</h3>
                <p className="text-xs text-slate-500 mt-1">
                  AI-powered career, resume, job search and interview assistant.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Application Name:</span>
                  <span className="font-semibold text-slate-900">JobReady AI</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Version:</span>
                  <span className="font-semibold text-slate-900">1.0.0 (Release Build 100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Target Platform:</span>
                  <span className="font-semibold text-slate-900">Android &amp; Modern Web</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">AI Architecture:</span>
                  <span className="font-semibold text-slate-900">Server-Side Gemini 3.8 Flash</span>
                </div>
              </div>

              {/* Mandatory Disclaimers */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>AI Content Disclaimer</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    AI-generated suggestions may contain errors. Review resumes, job information, and interview answers before using them. JobReady AI makes no employment, interview, or salary guarantees.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Resume Safety Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    JobReady AI helps improve the presentation and clarity of your real experience. Do not add qualifications, certifications, or achievements that you do not actually possess.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>External Job Listings</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Job information is aggregated from external employer listings. Always verify details on the original source before applying.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
