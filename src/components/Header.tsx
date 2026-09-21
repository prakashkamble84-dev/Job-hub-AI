/**
 * JobHub AI - Navigation Header & Top Utility Bar
 * Replicates the JobHub design with top contact bar, recruiter shortcuts,
 * WhatsApp alerts, and multi-role navigation.
 */

import React from 'react';
import {
  Sparkles,
  Settings,
  Bot,
  Activity,
  Smartphone,
  FileText,
  Briefcase,
  Zap,
  Search,
  LayoutDashboard,
  Radio,
  Globe,
  MapPin,
  MessageSquare,
  LogIn,
  LogOut,
  User,
  Building,
  MessageCircle,
  Users,
  Repeat,
  Phone,
  Mail,
  Plus,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
  onOpenAdmin: () => void;
  onOpenPlayStore: () => void;
  onOpenAuth: () => void;
  onOpenWhatsApp: () => void;
  unreadWhatsAppCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenAssistant,
  onOpenAdmin,
  onOpenPlayStore,
  onOpenAuth,
  onOpenWhatsApp,
  unreadWhatsAppCount = 1,
}) => {
  const { isPremium, openUpgradeModal } = useSubscription();
  const { user, firebaseUser, logout, role, switchRole } = useAuth();

  const isEmployer = role === 'employer';

  const candidateNavItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'discovery', label: 'Find Jobs', icon: Search },
    { id: 'resume', label: 'AI Resume', icon: FileText },
    { id: 'jobs_tailor', label: 'Tailor & Match', icon: Zap },
    { id: 'voice_live', label: 'Live Voice', icon: Radio, highlight: true },
    { id: 'gemini_chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'interview', label: 'Mock Practice', icon: Bot },
    { id: 'market_intel', label: 'Salaries & Intel', icon: Globe },
    { id: 'applications', label: 'Applied', icon: Briefcase },
  ];

  const employerNavItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'employer_portal', label: 'Recruiter Console', icon: Building, highlight: true },
    { id: 'employer_openings', label: 'Job Openings', icon: Briefcase },
    { id: 'employer_matching', label: 'AI Match & WhatsApp', icon: Sparkles },
    { id: 'market_intel', label: 'Salary Benchmarks', icon: Globe },
    { id: 'gemini_chat', label: 'Recruiter Advisor', icon: MessageSquare },
  ];

  const navItems = isEmployer ? employerNavItems : candidateNavItems;

  const handlePostJobClick = () => {
    if (!isEmployer) {
      switchRole('employer');
    }
    onSelectTab('employer_portal');
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      {/* ---------------------------------------------------- */}
      {/* TOP UTILITY BAR (Exact match to job.jpg top bar) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#0A071E] text-slate-300 text-[11px] font-medium border-b border-purple-950 px-4 sm:px-6 py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left contact info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>123 Business Street, New Delhi, India</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-purple-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>support@jobhub.com</span>
            </div>
          </div>

          {/* Right quick actions */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                if (!isEmployer) switchRole('employer');
                onSelectTab('employer_portal');
              }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              For Employers
            </button>

            <button
              onClick={handlePostJobClick}
              className="text-purple-300 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Post a Job
            </button>

            <div className="h-3 w-px bg-purple-900" />

            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-semibold">
                  {firebaseUser.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer text-[10px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-slate-200 hover:text-white font-semibold cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN NAVIGATION BAR */}
      {/* ---------------------------------------------------- */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: JobHub Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 text-purple-200" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  JobHub
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 -mt-1 hidden sm:block tracking-wide">
                Find Your Dream Job
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800'
                      : item.highlight
                      ? 'text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight && !isActive ? 'text-purple-500' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: WhatsApp Button, Role Pill, + Post a Job Button */}
        <div className="flex items-center gap-2.5">
          {/* WhatsApp Candidate Match Alerts */}
          <button
            id="btn-whatsapp-alerts"
            onClick={onOpenWhatsApp}
            className="relative p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 transition-all cursor-pointer flex items-center gap-1.5"
            title="WhatsApp Match Alerts & Direct Recruiter Outreach"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline text-xs font-bold text-emerald-700 dark:text-emerald-300">
              WhatsApp
            </span>
            {unreadWhatsAppCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                {unreadWhatsAppCount}
              </span>
            )}
          </button>

          {/* Role Switcher Pill */}
          <button
            id="btn-role-switcher"
            onClick={() => {
              const newRole = isEmployer ? 'candidate' : 'employer';
              switchRole(newRole);
              if (newRole === 'employer') {
                onSelectTab('employer_portal');
              } else {
                onSelectTab('home');
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-xs cursor-pointer ${
              isEmployer
                ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
            }`}
            title={`Switch to ${isEmployer ? 'Candidate' : 'Employer'} Mode`}
          >
            {isEmployer ? (
              <>
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Employer</span>
                <Repeat className="w-3 h-3 text-purple-400" />
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Candidate</span>
                <Repeat className="w-3 h-3 text-indigo-400" />
              </>
            )}
          </button>

          {/* + Post a Job Button (Matching the purple pill button in job.jpg) */}
          <button
            onClick={handlePostJobClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post a Job</span>
          </button>

          {/* Plan Pro Tier / Pricing Badge */}
          <div
            onClick={() => openUpgradeModal(isEmployer ? 'employer_plans' : 'candidate_plans')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 shadow-2xs ${
              isPremium
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                : isEmployer
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${isPremium ? 'text-amber-100' : 'text-amber-500'}`} />
            <span>{isPremium ? 'PRO' : isEmployer ? 'GROWTH' : 'FREE'}</span>
          </div>

          {/* Mobile Auth Button if not signed in */}
          {!firebaseUser && (
            <button
              onClick={onOpenAuth}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-xl cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Telemetry Console */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Telemetry Console"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Settings & Privacy Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Account & Privacy Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC<{ activeTab: string; onSelectTab: (tab: string) => void }> = ({
  activeTab,
  onSelectTab,
}) => {
  const { role } = useAuth();
  const isEmployer = role === 'employer';

  const candidateTabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'discovery', label: 'Jobs', icon: Search },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'voice_live', label: 'Voice AI', icon: Radio },
    { id: 'gemini_chat', label: 'Advisor', icon: MessageSquare },
  ];

  const employerTabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'employer_portal', label: 'Recruiter', icon: Building },
    { id: 'employer_openings', label: 'Openings', icon: Briefcase },
    { id: 'employer_matching', label: 'AI Match', icon: Sparkles },
    { id: 'gemini_chat', label: 'Advisor', icon: MessageSquare },
  ];

  const tabs = isEmployer ? employerTabs : candidateTabs;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
