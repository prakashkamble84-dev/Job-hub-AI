/**
 * JobHub AI - Main Application Entry & Routing
 * Features the JobHub Homepage matching the exact design of job.jpg,
 * Naukri.com parity features, AI Resume Analyzer, Gemini Mock Practice,
 * WhatsApp Recruiter alerts, and Employer hiring console.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { Header, BottomNav } from './components/Header';
import { JobHubLandingHome } from './components/JobHubLandingHome';
import { CareerDashboard } from './components/CareerDashboard';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { JobAnalyzer } from './components/JobAnalyzer';
import { VoiceInterviewCoach } from './components/VoiceInterviewCoach';
import { GeminiCareerChatbot } from './components/GeminiCareerChatbot';
import { InterviewCoach } from './components/InterviewCoach';
import { SearchGroundingIntel } from './components/SearchGroundingIntel';
import { MapsGroundingLocation } from './components/MapsGroundingLocation';
import { ApplicationTracker } from './components/ApplicationTracker';
import { JobDiscovery } from './components/JobDiscovery';
import { EmployerPortal } from './components/EmployerPortal';
import { WhatsAppNotificationDrawer } from './components/WhatsAppNotificationDrawer';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { CareerAssistantDrawer } from './components/CareerAssistantDrawer';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { PlayStoreReadinessModal } from './components/PlayStoreReadinessModal';
import { OfflineBanner } from './components/OfflineBanner';
import { remoteConfigService } from './services/remoteConfigService';
import type { ResumeAnalysis } from './types';

function MaintenanceScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-2xl font-bold">
        🛠️
      </div>
      <h1 className="text-2xl font-bold">Scheduled System Maintenance</h1>
      <p className="text-slate-400 mt-2 max-w-md text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
      >
        Check Again
      </button>
    </div>
  );
}

const INITIAL_DEFAULT_ANALYSIS: ResumeAnalysis = {
  id: 'analysis_initial',
  uid: 'usr_default',
  overallScore: 88,
  atsCompatibilityScore: 92,
  impactScore: 86,
  structureScore: 90,
  skillsScore: 84,
  summary: 'Strong technical profile with excellent modern frontend, backend API, and cloud deployment highlights.',
  strengths: [
    'Clean quantifiable metrics across project bullet points',
    'Demonstrated expertise in TypeScript, React, and Gemini AI integration',
    'Strong architectural understanding of cloud scalability and performance',
  ],
  improvements: [
    'Add specific mention of Core Web Vitals optimization techniques (LCP, INP)',
    'Incorporate keywords around micro-frontend state orchestration',
    'Include direct metrics on conversion rate impact for user-facing features',
  ],
  keywordsDetected: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'GraphQL', 'Jest', 'CI/CD'],
  missingKeywords: ['Core Web Vitals', 'Micro-Frontends', 'Docker', 'State Machine', 'Web Vitals'],
  createdAt: new Date().toISOString(),
};

function MainAppContent() {
  const { user, role, switchRole } = useAuth();
  const { showUpgradeModal, closeUpgradeModal, upgradeSource } = useSubscription();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(INITIAL_DEFAULT_ANALYSIS);
  const [overallScore, setOverallScore] = useState<number>(88);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);

  // Remote config & maintenance
  const [config, setConfig] = useState(remoteConfigService.getConfig());

  useEffect(() => {
    const unsub = remoteConfigService.subscribeConfig((newConfig) => {
      setConfig(newConfig);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  const handleAnalysisComplete = (analysis: ResumeAnalysis) => {
    setCurrentAnalysis(analysis);
    setOverallScore(analysis.overallScore);
  };

  const handleInterviewCompleted = (score: number) => {
    setOverallScore((prev) => Math.min(100, Math.round((prev + score) / 2)));
  };

  if (config.maintenanceMode) {
    return (
      <MaintenanceScreen
        message={config.maintenanceMessage}
        onRetry={() => remoteConfigService.fetchConfig()}
      />
    );
  }

  const allUserDataForExport = {
    userProfile: user,
    activeAnalysis: currentAnalysis,
    overallReadinessScore: overallScore,
    exportedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 pb-20 lg:pb-8">
      {/* Offline Alert */}
      <OfflineBanner />

      {/* Main Top Header with Top Utility Contact Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPlayStore={() => setIsPlayStoreOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppDrawerOpen(true)}
        unreadWhatsAppCount={1}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Home: Full JobHub Design & Two-Sided Portal */}
        {activeTab === 'home' && (
          <JobHubLandingHome
            onNavigateTab={setActiveTab}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenWhatsApp={() => setIsWhatsAppDrawerOpen(true)}
            onPostJob={() => {
              if (role !== 'employer') switchRole('employer');
              setActiveTab('employer_portal');
            }}
          />
        )}

        {/* Employer Portal Views */}
        {(activeTab === 'employer_portal' || activeTab === 'employer_openings' || activeTab === 'employer_matching') && (
          <EmployerPortal />
        )}

        {/* Candidate Dashboard Views */}
        {activeTab === 'dashboard' && (
          <CareerDashboard
            onNavigateTab={setActiveTab}
            overallScore={overallScore}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeAnalyzer
            currentAnalysis={currentAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'jobs_tailor' && <JobAnalyzer />}

        {activeTab === 'voice_live' && <VoiceInterviewCoach />}

        {activeTab === 'gemini_chat' && <GeminiCareerChatbot />}

        {activeTab === 'interview' && (
          <InterviewCoach onInterviewCompleted={handleInterviewCompleted} />
        )}

        {activeTab === 'market_intel' && <SearchGroundingIntel />}

        {activeTab === 'office_commute' && <MapsGroundingLocation />}

        {activeTab === 'applications' && <ApplicationTracker />}

        {activeTab === 'discovery' && <JobDiscovery />}
      </main>

      {/* Bottom Mobile Tab Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* WhatsApp Alerts Drawer */}
      <WhatsAppNotificationDrawer
        isOpen={isWhatsAppDrawerOpen}
        onClose={() => setIsWhatsAppDrawerOpen(false)}
      />

      {/* Role-Aware Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Slide-over Career AI Assistant Drawer */}
      <CareerAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Settings & Privacy Center Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        allUserDataForExport={allUserDataForExport}
      />

      {/* Billing & Dual Plan Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={closeUpgradeModal}
        sourceReason={upgradeSource}
      />

      {/* 7-Step Onboarding Flow */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
        onAnalyzeInitialResume={() => {}}
      />

      {/* Internal Admin Business Metrics Console */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Google Play Production Launch Readiness Modal */}
      <PlayStoreReadinessModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <MainAppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
