/**
 * JobReady AI - Career Dashboard & Readiness Hub (Phases 1 & 7)
 * Career readiness dial, daily actionable tasks, proactive advice, and quick launchpads.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Circle,
  FileText,
  Briefcase,
  Bot,
  Search,
  ArrowRight,
  Award,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import type { DailyPlan, DailyTask } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';

interface CareerDashboardProps {
  onNavigateTab: (tab: string) => void;
  overallScore: number;
}

const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_1',
    title: 'Polish Resume ATS Score to 90+',
    category: 'Resume',
    completed: false,
    estimatedMinutes: 10,
    actionLink: 'resume',
  },
  {
    id: 'task_2',
    title: 'Tailor resume for top target role at Linear',
    category: 'JobMatch',
    completed: false,
    estimatedMinutes: 15,
    actionLink: 'jobs_tailor',
  },
  {
    id: 'task_3',
    title: 'Complete 1 STAR Mock Interview session',
    category: 'Interview',
    completed: false,
    estimatedMinutes: 12,
    actionLink: 'interview',
  },
  {
    id: 'task_4',
    title: 'Follow up on pending Stripe application',
    category: 'FollowUp',
    completed: true,
    estimatedMinutes: 5,
    actionLink: 'applications',
  },
];

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
  onNavigateTab,
  overallScore,
}) => {
  const { user } = useAuth();
  const { isPremium, openUpgradeModal } = useSubscription();

  const [tasks, setTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          analyticsService.trackDailyTaskCompleted(taskId, next);
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Today's Focus: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to advance, {user?.displayName?.split(' ')[0] || 'Alex'}?
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Targeting <strong>{user?.targetRole || 'Senior Frontend Engineer'}</strong>. Complete today's high-impact action items to boost your interview readiness.
          </p>
        </div>

        {/* Career Readiness Score Badge */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-8 sm:top-1/2 sm:-translate-y-1/2 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Career Readiness</div>
          <div className="text-4xl font-black text-white my-1">{overallScore}%</div>
          <div className="text-[10px] text-emerald-300 font-semibold">Top 15% of Applicants</div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('resume')}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
            Analyze Resume
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Check ATS &amp; Keywords</div>
        </button>

        <button
          onClick={() => onNavigateTab('jobs_tailor')}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
            Tailor for Job
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Match description</div>
        </button>

        <button
          onClick={() => onNavigateTab('interview')}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-400 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-3 group-hover:text-purple-600 transition-colors">
            Mock Interview
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Real-time STAR drills</div>
        </button>

        <button
          onClick={() => onNavigateTab('applications')}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-3 group-hover:text-emerald-600 transition-colors">
            Track Pipeline
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Follow-ups &amp; Offers</div>
        </button>
      </div>

      {/* Main Content: Daily Plan + Proactive AI Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Daily Plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Priority Action Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
              </p>
            </div>

            <button
              onClick={() => setShowWeeklySummary(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Weekly Summary
            </button>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2 pt-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  task.completed ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {task.category} • ~{task.estimatedMinutes} mins
                    </div>
                  </div>
                </div>

                {task.actionLink && !task.completed && (
                  <button
                    onClick={() => onNavigateTab(task.actionLink!)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Proactive AI Guidance */}
        <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-2xl border border-indigo-100 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Proactive AI Career Coach</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              Increase ATS Match Rate for Frontend Roles
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your resume exhibits exceptional engineering experience, but modern job listings heavily index for <strong>Core Web Vitals</strong> and <strong>Micro-frontend architectures</strong>. Adding 2 quantified bullets will raise your match rate by an estimated ~14%.
            </p>
          </div>

          <div className="pt-4 border-t border-indigo-100">
            <button
              onClick={() => onNavigateTab('resume')}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Review Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Summary Modal */}
      {showWeeklySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Weekly Career Progress Summary</h3>
              <button onClick={() => setShowWeeklySummary(false)} className="text-xs font-semibold text-slate-500">
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xl font-bold text-blue-600">4</div>
                <div className="text-xs text-slate-500">Applications Sent</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xl font-bold text-purple-600">88%</div>
                <div className="text-xs text-slate-500">Avg Interview Score</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are on pace for a 2.4x higher interview callback rate. Keep maintaining your daily practice streak!
            </p>

            <button
              onClick={() => setShowWeeklySummary(false)}
              className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
