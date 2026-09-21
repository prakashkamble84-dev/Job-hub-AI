/**
 * JobReady AI - Job Application Tracker (Phase 6)
 * Visual status pipeline (Wishlist, Applied, Screening, Interview, Offer, Rejected) with follow-up tasks.
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Filter,
  X,
  ExternalLink,
  Bell
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types';
import { analyticsService } from '../services/analyticsService';

const PIPELINE_COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'Wishlist', title: 'Wishlist', color: 'border-slate-300 text-slate-700 bg-slate-50' },
  { id: 'Applied', title: 'Applied', color: 'border-blue-300 text-blue-700 bg-blue-50' },
  { id: 'Screening', title: 'Screening', color: 'border-purple-300 text-purple-700 bg-purple-50' },
  { id: 'Interview', title: 'Interview', color: 'border-amber-300 text-amber-700 bg-amber-50' },
  { id: 'Offer', title: 'Offer', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  { id: 'Rejected', title: 'Archived', color: 'border-rose-300 text-rose-700 bg-rose-50' },
];

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_1',
    uid: 'user_active',
    jobTitle: 'Senior Frontend Engineer',
    companyName: 'Linear',
    location: 'Remote',
    salary: '$150k - $175k',
    status: 'Interview',
    appliedDate: '2026-03-12',
    followUpDate: '2026-03-24',
    notes: 'Completed technical take-home review. Team match interview scheduled.',
    contactName: 'Sarah Connor (Technical Recruiter)',
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-18T14:30:00Z',
  },
  {
    id: 'app_2',
    uid: 'user_active',
    jobTitle: 'Lead UI Architect',
    companyName: 'Stripe',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$180k - $210k',
    status: 'Applied',
    appliedDate: '2026-03-15',
    followUpDate: '2026-03-22',
    notes: 'Submitted resume tailored with Next.js & performance metrics.',
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-03-15T11:00:00Z',
  },
  {
    id: 'app_3',
    uid: 'user_active',
    jobTitle: 'Staff Frontend Engineer',
    companyName: 'Vercel',
    location: 'Remote',
    salary: '$190k - $220k',
    status: 'Wishlist',
    appliedDate: '2026-03-20',
    notes: 'Need to tailor resume for edge runtime experience.',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-03-20T09:00:00Z',
  },
];

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('jobready_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Modal form states
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    localStorage.setItem('jobready_applications', JSON.stringify(applications));
  }, [applications]);

  const openAddModal = () => {
    setEditingApp(null);
    setJobTitle('');
    setCompanyName('');
    setLocation('Remote');
    setSalary('');
    setStatus('Applied');
    setFollowUpDate('');
    setNotes('');
    setContactName('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setJobTitle(app.jobTitle);
    setCompanyName(app.companyName);
    setLocation(app.location || '');
    setSalary(app.salary || '');
    setStatus(app.status);
    setFollowUpDate(app.followUpDate || '');
    setNotes(app.notes || '');
    setContactName(app.contactName || '');
    setIsModalOpen(true);
  };

  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !companyName.trim()) return;

    if (editingApp) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === editingApp.id
            ? {
                ...a,
                jobTitle,
                companyName,
                location,
                salary,
                status,
                followUpDate,
                notes,
                contactName,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );
      analyticsService.trackApplicationStatusChanged(status);
    } else {
      const newApp: JobApplication = {
        id: `app_${Date.now()}`,
        uid: 'user_active',
        jobTitle,
        companyName,
        location,
        salary,
        status,
        appliedDate: new Date().toISOString().split('T')[0],
        followUpDate,
        notes,
        contactName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setApplications((prev) => [newApp, ...prev]);
      analyticsService.trackApplicationAdded(companyName, jobTitle);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a))
    );
    analyticsService.trackApplicationStatusChanged(newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Job Application Tracker</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize every role from wishlist to offer with proactive follow-up tasks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Role</span>
        </button>
      </div>

      {/* Conversion Funnel Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {PIPELINE_COLUMNS.map((col) => {
          const count = applications.filter((a) => a.status === col.id).length;
          return (
            <div key={col.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500">{col.title}</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);
          return (
            <div key={col.id} className="flex flex-col rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3 min-w-[200px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 font-semibold text-slate-700">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.jobTitle}
                        </h4>
                        <div className="text-[11px] font-medium text-slate-600">{app.companyName}</div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(app)} className="p-1 text-slate-400 hover:text-slate-700">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {app.salary && (
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{app.salary}</span>
                      </div>
                    )}

                    {app.followUpDate && (
                      <div className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        <span>Follow up: {app.followUpDate}</span>
                      </div>
                    )}

                    {/* Quick Move Selector */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="text-[10px] bg-slate-50 border border-slate-200 rounded-md py-0.5 px-1 focus:outline-hidden font-medium"
                      >
                        {PIPELINE_COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingApp ? 'Edit Tracked Application' : 'Add New Job Application'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $140k - $160k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {PIPELINE_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Reminder Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter / Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor (Recruiter)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes &amp; Strategy</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Interview questions asked, referral info, next steps..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
