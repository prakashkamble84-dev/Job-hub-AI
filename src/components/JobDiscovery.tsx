/**
 * JobReady AI - Job Discovery, Match Scoring & Alerts (Phase 8)
 * Curated recommendations, job alert configurations, and side-by-side role comparisons.
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Bell,
  Sparkles,
  ExternalLink,
  Plus,
  Scale,
  X,
  CheckCircle2
} from 'lucide-react';
import type { JobListing, JobAlert } from '../types';
import { jobService } from '../services/jobService';
import { entitlementService } from '../services/entitlementService';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { PaywallBanner } from './PremiumUpgradeModal';

export const JobDiscovery: React.FC = () => {
  const { checkFeatureAccess, openUpgradeModal } = useSubscription();
  const { user } = useAuth();

  const [query, setQuery] = useState(user?.targetRole || 'Frontend Engineer');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'alerts'>('all');

  // Job Alerts
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [newAlertQuery, setNewAlertQuery] = useState(query);
  const [newAlertLocation, setNewAlertLocation] = useState('Remote');

  // Job Compare Modal
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    jobService.getSavedJobs('user_active').then((saved) => setSavedJobIds(saved.map((s) => s.job.id)));
    jobService.getJobAlerts('user_active').then((items) => setAlerts(items));
  }, []);

  const fetchJobs = async () => {
    const results = await jobService.searchJobs({
      query,
      location: locationFilter || undefined,
      type: employmentFilter || undefined,
    });
    setJobs(results);
    analyticsService.trackJobSearched(query, results.length);
  };

  const handleToggleSave = async (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;
    const isSaved = jobService.toggleSaveJob('user_active', targetJob);
    setSavedJobIds((prev) => (isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)));
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const allowed = checkFeatureAccess(() => entitlementService.canCreateJobAlert(alerts.length));
    if (!allowed) return;

    const newAlert = jobService.createJobAlert({
      uid: 'user_active',
      query: newAlertQuery,
      location: newAlertLocation,
      frequency: 'Daily',
    });

    setAlerts((prev) => [newAlert, ...prev]);
    entitlementService.recordJobAlertCreated();
    analyticsService.trackJobAlertCreated(newAlertQuery);
    setIsAlertModalOpen(false);
  };

  const toggleCompareJob = (jobId: string) => {
    if (compareJobIds.includes(jobId)) {
      setCompareJobIds((prev) => prev.filter((id) => id !== jobId));
    } else {
      if (compareJobIds.length >= 2) {
        setCompareJobIds([compareJobIds[1], jobId]);
      } else {
        setCompareJobIds((prev) => [...prev, jobId]);
      }
    }
  };

  const displayedJobs =
    activeTab === 'saved' ? jobs.filter((j) => savedJobIds.includes(j.id)) : jobs;

  const compareJobs = jobs.filter((j) => compareJobIds.includes(j.id));
  const alertLimit = entitlementService.canCreateJobAlert();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            <span>Job Discovery &amp; Match Scoring</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse high-match opportunities calibrated to your target roles and skills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareJobIds.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareJobIds.length}/2)</span>
            </button>
          )}

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span>Create Job Alert</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-2 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Recommendations ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-2.5 px-2 border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Roles ({savedJobIds.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-2.5 px-2 border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Job Alerts ({alerts.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      {activeTab !== 'alerts' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job title, skills, or company..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:w-48 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location (e.g. Remote)"
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      )}

      {/* Tab: Job Alerts Management */}
      {activeTab === 'alerts' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Configured Job Alerts</h3>
            <span className="text-xs text-slate-500">
              {alertLimit.isUnlimited
                ? 'Unlimited Alerts (Premium)'
                : `${alerts.length} of ${alertLimit.limit} free alerts used`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between shadow-2xs">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>{alert.query}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Location: {alert.location || 'Any'} • {alert.frequency} Digest
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Job Listings Cards */
        <div className="space-y-3">
          {displayedJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isComparing = compareJobIds.includes(job.id);
            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      {job.matchScore && (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">{job.company}</div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={() => toggleCompareJob(job.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                        isComparing
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleSave(job.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-blue-50 border-blue-300 text-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                      aria-label="Save job"
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Automated Job Alert</h3>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role / Keywords</label>
                <input
                  type="text"
                  required
                  value={newAlertQuery}
                  onChange={(e) => setNewAlertQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={newAlertLocation}
                  onChange={(e) => setNewAlertLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Side-by-Side Job Comparison</h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {compareJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                    <div className="text-xs font-semibold text-slate-600">{job.company}</div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <strong>Location:</strong> {job.location}
                    </div>
                    <div>
                      <strong>Salary:</strong> {job.salary}
                    </div>
                    <div>
                      <strong>Match Score:</strong> {job.matchScore}%
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700">Key Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white text-[10px] font-medium border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
