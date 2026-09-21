/**
 * JobReady AI - Employer & Recruiter Portal
 * Allows Employers to post job openings, execute Gemini AI Candidate Matchmaking,
 * review skill alignment & gaps, and dispatch direct WhatsApp job match alerts to candidates.
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  MessageCircle,
  Plus,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Building,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit3,
  TrendingUp,
  Award,
  Phone,
  Mail,
  Zap,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { firestoreService } from '../services/firestoreService';
import type { JobOpening, CandidateMatch, WhatsAppNotification, UserProfile } from '../types';

export const EmployerPortal: React.FC = () => {
  const { user } = useAuth();
  const { isPremium, openUpgradeModal } = useSubscription();

  // State
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [selectedOpening, setSelectedOpening] = useState<JobOpening | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppNotification[]>([]);
  const [talentPool, setTalentPool] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'openings' | 'matching' | 'whatsapp' | 'talent' | 'plans'>('openings');

  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappStatusFilter, setWhatsappStatusFilter] = useState<'ALL' | 'SENT' | 'DELIVERED'>('ALL');

  // New Opening Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Bangalore, India / Remote',
    workplaceType: 'Remote' as 'Remote' | 'On-site' | 'Hybrid',
    employmentType: 'Full-time' as 'Full-time' | 'Contract' | 'Part-time' | 'Internship',
    experienceMinYears: 3,
    experienceLevel: 'Mid' as 'Entry' | 'Mid' | 'Senior' | 'Lead',
    salaryMin: 1800000,
    salaryMax: 3200000,
    salaryCurrency: 'INR',
    description: '',
    requiredSkillsText: 'TypeScript, React, Tailwind CSS, Node.js, Gemini AI',
    niceToHaveSkillsText: 'Cloud Firestore, Next.js, WebSockets',
    autoWhatsAppMatch: true,
    whatsappTemplate: 'Hello {CandidateName}! 🎯 You have a strong profile match ({MatchScore}%) for *{JobTitle}* at *{CompanyName}*. We love your background in {MatchingSkills}. Let\'s connect for an interview!',
  });

  // Message customization modal
  const [customOutreachCandidate, setCustomOutreachCandidate] = useState<CandidateMatch | null>(null);
  const [customOutreachMsg, setCustomOutreachMsg] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  // Load Openings & Data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Openings
      const openingsRes = await fetch('/api/employer/openings');
      if (openingsRes.ok) {
        const data = await openingsRes.json();
        const list = data.openings || [];
        setOpenings(list);
        if (list.length > 0 && !selectedOpening) {
          setSelectedOpening(list[0]);
        }
      }

      // 2. Fetch WhatsApp Logs
      const waRes = await fetch('/api/notifications/whatsapp');
      if (waRes.ok) {
        const waData = await waRes.json();
        setWhatsappLogs(waData.notifications || []);
      }

      // 3. Fetch Talent Pool
      const talentRes = await fetch('/api/candidates/talent-pool');
      if (talentRes.ok) {
        const talentData = await talentRes.json();
        setTalentPool(talentData.candidates || []);
      }
    } catch (err) {
      console.warn('Error loading initial employer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected opening changes or user triggers matching
  const runCandidateMatching = async (opening: JobOpening) => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/employer/match-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingId: opening.id,
          customOpening: opening,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        setActiveSubTab('matching');
      }
    } catch (err) {
      console.error('Candidate matching error:', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Dispatch WhatsApp alert to a candidate
  const handleSendWhatsAppAlert = async (match: CandidateMatch, customText?: string) => {
    setIsSendingWhatsApp(true);
    try {
      const salaryText = selectedOpening?.salaryCurrency === 'INR'
        ? `₹${((selectedOpening?.salaryMin || 1500000) / 100000).toFixed(1)}L - ₹${((selectedOpening?.salaryMax || 3000000) / 100000).toFixed(1)}L`
        : `$${selectedOpening?.salaryMin || 100000} - $${selectedOpening?.salaryMax || 150000}`;

      const res = await fetch('/api/notifications/whatsapp-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: match.candidateId,
          recipientPhone: match.candidatePhone || '+919876543210',
          recipientName: match.candidateName,
          openingId: match.openingId,
          jobTitle: match.jobTitle,
          companyName: match.companyName,
          location: match.candidateLocation || 'Remote',
          salaryRange: salaryText,
          matchScore: match.matchPercentage,
          customMessage: customText || match.whatsappMessage,
          senderName: user?.companyName ? `${user.displayName} (${user.companyName})` : user?.displayName || 'Talent Acquisition Team',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotificationSuccess(`WhatsApp alert dispatched to ${match.candidateName}! Opening WhatsApp chat...`);
        
        // Update local match state
        setMatches((prev) =>
          prev.map((m) => (m.id === match.id ? { ...m, whatsappSent: true } : m))
        );

        // Update local logs
        if (data.notification) {
          setWhatsappLogs((prev) => [data.notification, ...prev]);
        }

        // Open WhatsApp web or app directly
        if (data.directWhatsAppUrl) {
          window.open(data.directWhatsAppUrl, '_blank');
        }

        setTimeout(() => setNotificationSuccess(null), 5000);
        setCustomOutreachCandidate(null);
      }
    } catch (err) {
      console.error('Failed to send WhatsApp alert:', err);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Submit New Job Opening
  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsLoading(true);
    try {
      const requiredSkills = formData.requiredSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const niceToHaveSkills = formData.niceToHaveSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        employerId: user?.uid || 'usr_employer_talentcorp',
        employerName: user?.displayName || 'Hiring Manager',
        companyName: user?.companyName || 'TalentCorp AI & Cloud Systems',
        title: formData.title,
        department: formData.department,
        location: formData.location,
        workplaceType: formData.workplaceType,
        employmentType: formData.employmentType,
        experienceMinYears: Number(formData.experienceMinYears),
        experienceLevel: formData.experienceLevel,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        salaryCurrency: formData.salaryCurrency,
        description: formData.description,
        requiredSkills,
        niceToHaveSkills,
        status: 'OPEN' as const,
        autoWhatsAppMatch: formData.autoWhatsAppMatch,
        whatsappTemplate: formData.whatsappTemplate,
      };

      const res = await fetch('/api/employer/openings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.opening;
        setOpenings((prev) => [created, ...prev]);
        setSelectedOpening(created);
        setIsPostingModalOpen(false);

        // Also save to Firestore for persistence
        await firestoreService.saveJobOpening(created);

        // Run matching immediately
        runCandidateMatching(created);
      }
    } catch (err) {
      console.error('Failed to post opening:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete opening
  const handleDeleteOpening = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/employer/openings/${id}`, { method: 'DELETE' });
      setOpenings((prev) => prev.filter((o) => o.id !== id));
      if (selectedOpening?.id === id) {
        setSelectedOpening(openings.find((o) => o.id !== id) || null);
      }
    } catch (err) {
      console.error('Delete opening error:', err);
    }
  };

  // Quick stats
  const totalOpenings = openings.length;
  const totalDispatches = whatsappLogs.length;
  const avgMatchRate = matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + m.matchPercentage, 0) / matches.length)
    : 89;

  return (
    <div id="employer-portal-root" className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-400/30">
              <Building className="w-3.5 h-3.5" />
              <span>Employer & Talent Acquisition Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Post Openings & Match Candidates via WhatsApp
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Leverage Gemini AI to screen candidate profiles, evaluate exact skill alignments, and dispatch 
              automated WhatsApp alerts to shortlisted candidates in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-post-job-opening"
              onClick={() => setIsPostingModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opening</span>
            </button>
            <button
              onClick={() => openUpgradeModal('employer_plans')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Employer Plans</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Openings</span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalOpenings}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">● Ready for candidate matching</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Talent Pool</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{talentPool.length || 5} Profiles</div>
            <div className="text-[11px] text-sky-400 mt-0.5">Verified candidate resumes</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>WhatsApp Alerts Sent</span>
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalDispatches}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">100% Instant Delivery</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Avg AI Fit Score</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{avgMatchRate}%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Top-quartile candidates</div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notificationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{notificationSuccess}</span>
          </div>
          <button
            onClick={() => setNotificationSuccess(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-sub-openings"
            onClick={() => setActiveSubTab('openings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'openings'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Openings ({openings.length})</span>
          </button>

          <button
            id="tab-sub-matching"
            onClick={() => {
              if (selectedOpening) runCandidateMatching(selectedOpening);
              else setActiveSubTab('matching');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'matching'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Candidate Matcher {matches.length > 0 && `(${matches.length})`}</span>
          </button>

          <button
            id="tab-sub-whatsapp"
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>WhatsApp Outbox ({whatsappLogs.length})</span>
          </button>

          <button
            id="tab-sub-talent"
            onClick={() => setActiveSubTab('talent')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'talent'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Talent Pool Directory</span>
          </button>
        </div>

        <button
          onClick={loadInitialData}
          disabled={isLoading}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* SUBTAB 1: JOB OPENINGS */}
      {activeSubTab === 'openings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Job Openings</h2>
              <p className="text-xs text-slate-500">Select an opening to view matched candidate profiles or launch WhatsApp outreach.</p>
            </div>
            <button
              onClick={() => setIsPostingModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Opening</span>
            </button>
          </div>

          {openings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No active job openings posted yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Post your first opening to automatically trigger Gemini AI candidate screening and WhatsApp alerts.
              </p>
              <button
                onClick={() => setIsPostingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Post Opening Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openings.map((opening) => {
                const isSelected = selectedOpening?.id === opening.id;
                const salaryFormatted = opening.salaryCurrency === 'INR'
                  ? `₹${(opening.salaryMin / 100000).toFixed(1)}L - ₹${(opening.salaryMax / 100000).toFixed(1)}L`
                  : `$${opening.salaryMin.toLocaleString()} - $${opening.salaryMax.toLocaleString()}`;

                return (
                  <div
                    key={opening.id}
                    onClick={() => setSelectedOpening(opening)}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
                            {opening.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                            {opening.workplaceType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                            {opening.experienceLevel} Level
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                          {opening.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>{opening.companyName}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{opening.location}</span>
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteOpening(opening.id, e)}
                        title="Delete opening"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {opening.description || 'Full job requirements matching candidates in our verified talent pool.'}
                    </div>

                    {/* Required Skills tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {opening.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{salaryFormatted}</span>
                      </div>

                      <button
                        id={`btn-match-${opening.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpening(opening);
                          runCandidateMatching(opening);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>AI Match Candidates</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: AI CANDIDATE MATCHING */}
      {activeSubTab === 'matching' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Active Target Opening</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {selectedOpening ? selectedOpening.title : 'No Opening Selected'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedOpening ? `${selectedOpening.companyName} • ${selectedOpening.location} • ${selectedOpening.requiredSkills.join(', ')}` : 'Select an opening from the Openings tab.'}
              </p>
            </div>

            {selectedOpening && (
              <button
                onClick={() => runCandidateMatching(selectedOpening)}
                disabled={isMatching}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
                <span>{isMatching ? 'Evaluating Candidate Skills...' : 'Re-Run AI Matching'}</span>
              </button>
            )}
          </div>

          {/* Candidate Match List */}
          {isMatching ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyzing registered talent pool with Gemini AI...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Comparing candidate skillsets, experience levels, and ATS scores to calculate match scores and personalized WhatsApp outreach.
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No candidate match results generated yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click "AI Match Candidates" on any opening to screen our registered candidate pool.
              </p>
              {openings.length > 0 && (
                <button
                  onClick={() => runCandidateMatching(openings[0])}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Match Candidates for {openings[0].title}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong>{matches.length}</strong> AI-ranked candidates for this role</span>
                <span className="text-emerald-600 font-bold">● Ranked by skill fit & relevance</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {matches.map((match) => {
                  const isHighFit = match.matchPercentage >= 85;
                  const scoreBg = isHighFit
                    ? 'bg-emerald-500 text-white'
                    : match.matchPercentage >= 70
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-500 text-white';

                  return (
                    <div
                      key={match.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Candidate Basic Info */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            {match.candidateName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                {match.candidateName}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${scoreBg}`}>
                                {match.matchPercentage}% AI Fit
                              </span>
                              {match.whatsappSent && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> WhatsApp Sent
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                              {match.candidateRole} • {match.candidateExperience} • {match.candidateLocation}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <strong>WhatsApp:</strong> {match.candidatePhone || '+91 98765 43210'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-sky-600" />
                                {match.candidateEmail}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Outreach Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            id={`btn-custom-wa-${match.candidateId}`}
                            onClick={() => {
                              setCustomOutreachCandidate(match);
                              setCustomOutreachMsg(match.whatsappMessage || '');
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Message</span>
                          </button>

                          <button
                            id={`btn-send-wa-${match.candidateId}`}
                            onClick={() => handleSendWhatsAppAlert(match)}
                            disabled={isSendingWhatsApp}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{match.whatsappSent ? 'Send Follow-up WhatsApp' : 'Send WhatsApp Alert'}</span>
                          </button>
                        </div>
                      </div>

                      {/* AI Fit Analysis & Skill Alignment */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>AI Recommendation</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{match.aiRecommendation}"
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Matching Skills ({match.matchingSkills.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.matchingSkills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Skill Gaps ({match.missingSkills.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.missingSkills.length > 0 ? (
                              match.missingSkills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-semibold"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500">100% Core Requirements Met</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Message Preview Bar */}
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 truncate">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate"><strong>WhatsApp Draft:</strong> {match.whatsappMessage}</span>
                        </div>
                        <a
                          href={match.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Open wa.me</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: WHATSAPP OUTBOX & NOTIFICATIONS */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp Notification Dispatch Center</span>
              </h2>
              <p className="text-xs text-slate-500">
                Audit log of all job match alerts delivered to candidates over WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWhatsappStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  whatsappStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({whatsappLogs.length})
              </button>
              <button
                onClick={() => setWhatsappStatusFilter('DELIVERED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  whatsappStatusFilter === 'DELIVERED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>

          {whatsappLogs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <MessageCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No WhatsApp messages dispatched yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                When you or your automated matcher dispatches job alerts, the delivery logs and click-to-chat links will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {whatsappLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {log.recipientName} ({log.recipientPhone})
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                          {log.status}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {log.matchScore}% Match
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Role: <strong>{log.jobTitle}</strong> at {log.companyName} • {log.salaryRange}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-2 font-mono text-[11px] leading-relaxed">
                        "{log.messageText}"
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Sent via {log.senderName} • {new Date(log.sentAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <a
                    href={log.directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer flex-shrink-0"
                  >
                    <span>Open WhatsApp Chat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TALENT POOL DIRECTORY */}
      {activeSubTab === 'talent' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>Verified Candidate Talent Pool</span>
              </h2>
              <p className="text-xs text-slate-500">
                Explore registered candidates, review skill matrices, and initiate WhatsApp outreach.
              </p>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills or roles..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {talentPool
              .filter((c) =>
                searchQuery
                  ? c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.targetRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
                  : true
              )
              .map((cand) => (
                <div
                  key={cand.uid}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center">
                          {cand.displayName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cand.displayName}
                          </h3>
                          <p className="text-xs text-slate-500">{cand.targetRole}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-black">
                        ATS {cand.atsScore || 90}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                      {cand.resumeSummary || 'Experienced software professional with demonstrated impact in modern web systems.'}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {(cand.skills || []).map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {cand.preferredLocation}
                    </span>

                    <a
                      href={`https://wa.me/${cand.whatsappNumber?.replace(/[^0-9]/g, '') || '919876543210'}?text=${encodeURIComponent(`Hello ${cand.displayName}! We came across your JobReady AI profile and would love to discuss exciting engineering opportunities at our company.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Invite</span>
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* POST NEW OPENING MODAL */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post New Job Opening</h3>
                <p className="text-xs text-slate-500">Trigger automatic candidate matching & WhatsApp outreach</p>
              </div>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOpening} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Frontend & AI Engineer"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Core Engineering"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Workplace Type</label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e: any) => setFormData({ ...formData, workplaceType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e: any) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Entry">Entry (0-2 yrs)</option>
                    <option value="Mid">Mid (2-5 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Lead">Lead / Architect (8+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Salary Range (INR / USD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                      placeholder="Min"
                      className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                      placeholder="Max"
                      className="w-1/2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Required Skills (Comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={formData.requiredSkillsText}
                    onChange={(e) => setFormData({ ...formData, requiredSkillsText: e.target.value })}
                    placeholder="TypeScript, React, Node.js, Gemini API"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe key responsibilities, team impact, and day-to-day deliverables..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Auto-Dispatch WhatsApp Alerts to Matching Candidates
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoWhatsAppMatch}
                    onChange={(e) => setFormData({ ...formData, autoWhatsAppMatch: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  When enabled, candidates scoring 75%+ match will automatically receive an invitation over WhatsApp with salary and opening details.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isLoading ? 'Posting & Matching...' : 'Publish Opening & Run AI Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM WHATSAPP OUTREACH MODAL */}
      {customOutreachCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Customize WhatsApp Invite to {customOutreachCandidate.candidateName}
                </h3>
              </div>
              <button
                onClick={() => setCustomOutreachCandidate(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Phone Number (WhatsApp)
                </label>
                <input
                  type="text"
                  disabled
                  value={customOutreachCandidate.candidatePhone || '+91 98765 43210'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  WhatsApp Message Body
                </label>
                <textarea
                  rows={5}
                  value={customOutreachMsg}
                  onChange={(e) => setCustomOutreachMsg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCustomOutreachCandidate(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppAlert(customOutreachCandidate, customOutreachMsg)}
                  disabled={isSendingWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
