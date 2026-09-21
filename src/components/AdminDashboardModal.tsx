/**
 * JobReady AI - Business & Admin Metrics Dashboard
 * Internal console for user growth, AI cost per user, conversion rates, and remote config tuning.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Users,
  DollarSign,
  Cpu,
  TrendingUp,
  Activity,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import type { AdminMetrics, RemoteAppConfig } from '../types';
import { remoteConfigService } from '../services/remoteConfigService';

export const AdminDashboardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [config, setConfig] = useState<RemoteAppConfig>(remoteConfigService.getConfig());
  const [activeTab, setActiveTab] = useState<'metrics' | 'config' | 'telemetry'>('metrics');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch {
      // offline fallback
      setMetrics({
        totalUsers: 1420,
        activeUsersMonthly: 890,
        freeUsers: 760,
        premiumUsers: 130,
        conversionRate: 14.6,
        totalAIRequests: 3480,
        totalTokensUsed: 1350000,
        estimatedAICostUSD: 18.95,
        averageAICostPerUserUSD: 0.021,
        jobSearchesCount: 4890,
        applicationsCount: 2150,
        interviewsCompletedCount: 940,
      });
    }
    setLoading(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await remoteConfigService.updateAdminConfig(config);
    setLoading(false);
    if (success) {
      setSaveStatus('Remote configuration published live.');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

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
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold">JobReady Business &amp; AI Telemetry Dashboard</h3>
              <p className="text-xs text-slate-400">Internal operations console • Confidential</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Business &amp; Cost Metrics
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Remote Config &amp; Feature Flags
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {saveStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> Total Users
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.totalUsers}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{metrics?.activeUsersMonthly} MAU</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Conversion Rate
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.conversionRate}%</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{metrics?.premiumUsers} Subscribers</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" /> AI Requests
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.totalAIRequests}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{(Number(metrics?.totalTokensUsed || 0) / 1000).toFixed(0)}k Tokens</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" /> AI Cost / User
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">${metrics?.averageAICostPerUserUSD}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Total AI: ${metrics?.estimatedAICostUSD}</div>
                </div>
              </div>

              {/* Engagement funnel overview */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Product Engagement Funnel</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-lg font-bold text-slate-900">{metrics?.jobSearchesCount}</div>
                    <div className="text-xs text-slate-500">Job Searches</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-lg font-bold text-slate-900">{metrics?.applicationsCount}</div>
                    <div className="text-xs text-slate-500">Tracked Applications</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-lg font-bold text-slate-900">{metrics?.interviewsCompletedCount}</div>
                    <div className="text-xs text-slate-500">Mock Interviews</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* Feature Flags */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Feature Flags (Kill Switches)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(config.featureFlags).map(([flag, enabled]) => (
                    <label key={flag} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <span className="text-xs font-medium text-slate-800">{flag}</span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            featureFlags: { ...config.featureFlags, [flag]: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded-sm"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">Maintenance Mode Active</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded-sm"
                  />
                </div>
                <input
                  type="text"
                  value={config.maintenanceMessage}
                  onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white"
                  placeholder="Maintenance message displayed to users"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Remote Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
