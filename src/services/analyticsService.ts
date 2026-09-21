/**
 * JobReady AI - Privacy-Conscious Analytics & Telemetry Service
 * Tracks application funnel events, feature usage, monetization events, and performance.
 */

import type { AnalyticsEvent } from '../types';

class AnalyticsService {
  private uid: string | null = null;
  private enabled = true;

  public setUid(uid: string | null) {
    this.uid = uid;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    // Sanitize any accidental sensitive parameters
    const safeProps = { ...properties };
    delete safeProps.password;
    delete safeProps.token;
    delete safeProps.resumeText;
    delete safeProps.rawText;
    delete safeProps.rawJobDescription;
    delete safeProps.answer;

    const payload: AnalyticsEvent = {
      event,
      uid: this.uid || undefined,
      timestamp: new Date().toISOString(),
      properties: safeProps,
    };

    fetch('/api/telemetry/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  public trackEvent(event: string, properties?: Record<string, any>) {
    this.track(event, properties);
  }

  public trackAction(action: string, properties?: Record<string, any>) {
    this.track(action, properties);
  }

  public trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
    this.track('feature_used', { featureName, ...properties });
  }

  // Funnel shortcuts
  public trackSignup(method: string) {
    this.track('signup', { method });
  }

  public trackLogin(method: string) {
    this.track('login', { method });
  }

  public trackOnboardingCompleted() {
    this.track('onboarding_completed');
  }

  public trackResumeUploaded() {
    this.track('resume_uploaded');
  }

  public trackResumeAnalyzed(overallScore: number) {
    this.track('resume_analyzed', { overallScore });
  }

  public trackResumeTailored(matchScore?: number) {
    this.track('resume_tailored', { matchScore });
  }

  public trackInterviewStarted(role: string) {
    this.track('interview_started', { role });
  }

  public trackInterviewCompleted(overallScore: number) {
    this.track('interview_completed', { overallScore });
  }

  public trackJobSearch(query?: string, ...rest: any[]) {
    this.track('job_search', { query, extra: rest });
  }

  public trackJobSearched(query?: string, ...rest: any[]) {
    this.track('job_search', { query, extra: rest });
  }

  public trackJobAlertCreated(title?: string, ...rest: any[]) {
    this.track('job_alert_created', { title, extra: rest });
  }

  public trackApplicationAdded(company?: string, role?: string) {
    this.track('application_added', { company, role });
  }

  public trackApplicationStatusChanged(id?: string, status?: string) {
    this.track('application_status_changed', { id, status });
  }

  public trackDailyTaskCompleted(taskId?: string, ...rest: any[]) {
    this.track('daily_task_completed', { taskId, extra: rest });
  }

  public trackCareerAdvisorMessageSent(category?: string) {
    this.track('career_advisor_message_sent', { category });
  }

  public trackAccountDeleted() {
    this.track('account_deleted');
  }

  public trackPaywallViewed(sourceReason?: string) {
    this.track('paywall_viewed', { sourceReason: sourceReason || 'manual' });
  }

  public trackPremiumScreenViewed(sourceReason?: string) {
    this.track('paywall_viewed', { sourceReason: sourceReason || 'manual' });
  }

  public trackPurchaseStarted(productId: string) {
    this.track('purchase_started', { productId });
  }

  public trackPurchaseAttempted(productId: string) {
    this.track('purchase_attempted', { productId });
  }

  public trackPurchaseCompleted(productId: string, orderId?: string) {
    this.track('purchase_success', { productId, orderId: orderId || 'simulated' });
  }

  public trackPurchaseSuccess(productId: string, orderId?: string) {
    this.track('purchase_success', { productId, orderId: orderId || 'simulated' });
  }

  public trackPurchaseFailed(productId: string, error: string) {
    this.track('purchase_failed', { productId, error });
  }

  public trackSubscriptionRestored(success?: boolean) {
    this.track('subscription_restored', { success });
  }

  public trackCrash(errorName: string, errorMessage: string) {
    this.track('app_crash', { errorName, errorMessage });
  }
}

export const analyticsService = new AnalyticsService();
