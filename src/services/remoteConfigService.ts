/**
 * JobReady AI - Remote Configuration Service
 * Handles feature flags, dynamic limit configuration, maintenance mode, and app versioning checks.
 */

import type { RemoteAppConfig } from '../types';
import { entitlementService, DEFAULT_FREE_LIMITS, DEFAULT_PREMIUM_LIMITS } from './entitlementService';

const DEFAULT_CONFIG: RemoteAppConfig = {
  appVersion: '1.0.0',
  buildNumber: 100,
  minimumSupportedVersion: '1.0.0',
  latestVersion: '1.0.0',
  updateMessage: 'A new version of JobReady AI is available with improved AI accuracy!',
  maintenanceMode: false,
  maintenanceMessage: 'JobReady AI is temporarily undergoing scheduled maintenance. Please check back shortly.',
  featureFlags: {
    jobSearchEnabled: true,
    jobAlertsEnabled: true,
    careerAssistantEnabled: true,
    premiumEnabled: true,
    interviewCoachEnabled: true,
    aiTailoringEnabled: true,
  },
  freeLimits: DEFAULT_FREE_LIMITS,
  premiumLimits: DEFAULT_PREMIUM_LIMITS,
  pricing: {
    monthly: {
      productId: 'jobready_premium_monthly',
      billingPeriod: 'MONTHLY',
      amount: 199,
      currency: 'INR',
      formatted: '₹199 / month',
      trialDays: 7,
    },
    yearly: {
      productId: 'jobready_premium_yearly',
      billingPeriod: 'YEARLY',
      amount: 999,
      currency: 'INR',
      formatted: '₹999 / year (Save 58%)',
      trialDays: 14,
    },
  },
  paywallHeadline: 'Prepare smarter. Apply better.',
  paywallSubheadline: 'Unlock unlimited AI resume tailoring, interview coach sessions, and automated job alerts with JobReady Premium.',
};

class RemoteConfigService {
  private config: RemoteAppConfig = DEFAULT_CONFIG;
  private listeners: ((config: RemoteAppConfig) => void)[] = [];

  constructor() {
    this.fetchConfig();
  }

  public async fetchConfig(): Promise<RemoteAppConfig> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        this.config = await res.json();
        entitlementService.setConfiguredLimits(this.config.freeLimits, this.config.premiumLimits);
        this.notify();
      }
    } catch {
      // Offline fallback
    }
    return this.config;
  }

  public getConfig(): RemoteAppConfig {
    return this.config;
  }

  public subscribe(cb: (config: RemoteAppConfig) => void) {
    this.listeners.push(cb);
    cb(this.config);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public subscribeConfig(cb: (config: RemoteAppConfig) => void) {
    return this.subscribe(cb);
  }

  private notify() {
    for (const cb of this.listeners) {
      cb(this.config);
    }
  }

  public async updateAdminConfig(updates: Partial<RemoteAppConfig>): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        this.config = data.config;
        this.notify();
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}

export const remoteConfigService = new RemoteConfigService();
