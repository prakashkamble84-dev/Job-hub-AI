/**
 * JobReady AI - Entitlement & Usage Service
 * Centralized gatekeeper for all feature limits, usage counters, and premium entitlements.
 * Monthly usage periods (e.g. "2026-09").
 */

import type { UserUsage, PlanType, PlanConfig } from '../types';
import { subscriptionService } from './subscriptionService';

export interface FeatureUsageStatus {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  featureName: string;
}

export const DEFAULT_FREE_LIMITS: PlanConfig['limits'] = {
  resumeAnalysis: 3,
  resumeTailor: 2,
  interviewCoachSessions: 2,
  careerAssistantMessages: 15,
  jobAnalysis: 5,
  jobSearchQueries: 20,
  savedJobs: 10,
  jobAlerts: 1,
  careerPlans: 2,
  skillPracticeSessions: 2,
  jobOpenings: 1,
  candidateMatches: 5,
  whatsappAlertsPerMonth: 5,
};

export const DEFAULT_PREMIUM_LIMITS: PlanConfig['limits'] = {
  resumeAnalysis: 100,
  resumeTailor: 100,
  interviewCoachSessions: 50,
  careerAssistantMessages: 500,
  jobAnalysis: 100,
  jobSearchQueries: 500,
  savedJobs: 200,
  jobAlerts: 20,
  careerPlans: 50,
  skillPracticeSessions: 50,
  jobOpenings: 50,
  candidateMatches: 500,
  whatsappAlertsPerMonth: 500,
};

class EntitlementService {
  private usage: UserUsage;
  private limits: { FREE: PlanConfig['limits']; PREMIUM: PlanConfig['limits'] } = {
    FREE: DEFAULT_FREE_LIMITS,
    PREMIUM: DEFAULT_PREMIUM_LIMITS,
  };
  private listeners: ((usage: UserUsage) => void)[] = [];

  constructor() {
    this.usage = this.loadUsage();
  }

  public getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private loadUsage(): UserUsage {
    const currentPeriod = this.getCurrentPeriod();
    const defaultUsage: UserUsage = {
      uid: 'user_active',
      period: currentPeriod,
      resumeAnalysisCount: 0,
      resumeTailorCount: 0,
      interviewCount: 0,
      assistantMessageCount: 0,
      jobAnalysisCount: 0,
      jobSearchCount: 0,
      jobAlertCount: 0,
      careerPlanCount: 0,
      skillPracticeCount: 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem('jobready_user_usage');
      if (saved) {
        const parsed: UserUsage = JSON.parse(saved);
        if (parsed.period === currentPeriod) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback
    }

    return defaultUsage;
  }

  private persistUsage() {
    try {
      this.usage.updatedAt = new Date().toISOString();
      localStorage.setItem('jobready_user_usage', JSON.stringify(this.usage));
      for (const cb of this.listeners) {
        cb(this.usage);
      }
    } catch {
      // Storage safety
    }
  }

  public subscribeUsage(cb: (usage: UserUsage) => void) {
    this.listeners.push(cb);
    cb(this.usage);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public setConfiguredLimits(free: PlanConfig['limits'], premium: PlanConfig['limits']) {
    this.limits.FREE = free;
    this.limits.PREMIUM = premium;
  }

  public getActiveLimits(): PlanConfig['limits'] {
    const isPremium = subscriptionService.isPremiumActive();
    return isPremium ? this.limits.PREMIUM : this.limits.FREE;
  }

  public getUserPlan(): PlanType {
    return subscriptionService.isPremiumActive() ? 'PREMIUM' : 'FREE';
  }

  public getUsage(): UserUsage {
    return this.usage;
  }

  // --- Granular Feature Checks ---

  public canUseResumeAnalysis(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.resumeAnalysisCount;
    const limit = limits.resumeAnalysis ?? 3;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Resume Analysis',
    };
  }

  public canTailorResume(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.resumeTailorCount;
    const limit = limits.resumeTailor ?? 2;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'AI Resume Tailoring',
    };
  }

  public canStartInterview(): FeatureUsageStatus {
    return this.canUseInterviewCoach();
  }

  public canUseInterviewCoach(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.interviewCount;
    const limit = limits.interviewCoachSessions ?? 2;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Interview Coach Session',
    };
  }

  public canSendAssistantMessage(): FeatureUsageStatus {
    return this.canUseCareerAssistant();
  }

  public canUseCareerAssistant(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.assistantMessageCount;
    const limit = limits.careerAssistantMessages ?? 15;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Career Assistant Message',
    };
  }

  public canAnalyzeJob(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.jobAnalysisCount;
    const limit = limits.jobAnalysis ?? 5;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Job Description Analysis',
    };
  }

  public canSearchJobs(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.jobSearchCount;
    const limit = limits.jobSearchQueries ?? 20;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Job Search Query',
    };
  }

  public canSaveJob(currentSavedCount = 0): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const limit = limits.savedJobs ?? 10;
    return {
      allowed: currentSavedCount < limit,
      current: currentSavedCount,
      limit,
      remaining: Math.max(0, limit - currentSavedCount),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Saved Job Limit',
    };
  }

  public canCreateJobAlert(currentAlertCount = 0): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const limit = limits.jobAlerts ?? 1;
    return {
      allowed: currentAlertCount < limit,
      current: currentAlertCount,
      limit,
      remaining: Math.max(0, limit - currentAlertCount),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Job Alert Limit',
    };
  }

  public canCreateCareerPlan(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.careerPlanCount;
    const limit = limits.careerPlans ?? 2;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Daily Career Plan Generator',
    };
  }

  public canPracticeSkill(): FeatureUsageStatus {
    const limits = this.getActiveLimits();
    const current = this.usage.skillPracticeCount;
    const limit = limits.skillPracticeSessions ?? 2;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isUnlimited: subscriptionService.isPremiumActive(),
      featureName: 'Skill Gap Practice',
    };
  }

  // --- Increment Trackers ---

  public recordResumeAnalysis() {
    this.usage.resumeAnalysisCount += 1;
    this.persistUsage();
  }

  public recordResumeTailor() {
    this.usage.resumeTailorCount += 1;
    this.persistUsage();
  }

  public recordResumeTailoring() {
    this.recordResumeTailor();
  }

  public recordInterview() {
    this.usage.interviewCount += 1;
    this.persistUsage();
  }

  public recordInterviewSession() {
    this.recordInterview();
  }

  public recordAssistantMessage() {
    this.usage.assistantMessageCount += 1;
    this.persistUsage();
  }

  public recordJobAnalysis() {
    this.usage.jobAnalysisCount += 1;
    this.persistUsage();
  }

  public recordJobSearch() {
    this.usage.jobSearchCount += 1;
    this.persistUsage();
  }

  public recordJobAlert() {
    this.usage.jobAlertCount += 1;
    this.persistUsage();
  }

  public recordJobAlertCreated() {
    this.recordJobAlert();
  }

  public recordCareerPlan() {
    this.usage.careerPlanCount += 1;
    this.persistUsage();
  }

  public recordSkillPractice() {
    this.usage.skillPracticeCount += 1;
    this.persistUsage();
  }

  public resetUsageForTesting() {
    this.usage = {
      uid: 'user_active',
      period: this.getCurrentPeriod(),
      resumeAnalysisCount: 0,
      resumeTailorCount: 0,
      interviewCount: 0,
      assistantMessageCount: 0,
      jobAnalysisCount: 0,
      jobSearchCount: 0,
      jobAlertCount: 0,
      careerPlanCount: 0,
      skillPracticeCount: 0,
      updatedAt: new Date().toISOString(),
    };
    this.persistUsage();
  }
}

export const entitlementService = new EntitlementService();
