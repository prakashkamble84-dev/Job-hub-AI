/**
 * JobReady AI - Subscription Service
 * Abstraction layer for Google Play Billing and Web Subscriptions.
 * Validates purchase tokens with backend server.
 */

import type { UserEntitlement, PlanPricing } from '../types';

export interface SubscriptionProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  amount: number;
  currency: string;
  period: string;
  role: 'candidate' | 'employer';
  features: string[];
  popular?: boolean;
}

class SubscriptionService {
  private currentEntitlement: UserEntitlement | null = null;
  private listeners: ((entitlement: UserEntitlement | null) => void)[] = [];

  constructor() {
    this.loadCachedEntitlement();
  }

  private loadCachedEntitlement() {
    try {
      const saved = localStorage.getItem('jobready_user_entitlement');
      if (saved) {
        this.currentEntitlement = JSON.parse(saved);
      }
    } catch {
      // LocalStorage fallback
    }
  }

  private saveEntitlement(entitlement: UserEntitlement | null) {
    this.currentEntitlement = entitlement;
    if (entitlement) {
      localStorage.setItem('jobready_user_entitlement', JSON.stringify(entitlement));
    } else {
      localStorage.removeItem('jobready_user_entitlement');
    }
    this.notifyListeners();
  }

  public subscribe(callback: (entitlement: UserEntitlement | null) => void) {
    this.listeners.push(callback);
    callback(this.currentEntitlement);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentEntitlement);
    }
  }

  public async getProducts(role: 'candidate' | 'employer' = 'candidate'): Promise<SubscriptionProduct[]> {
    try {
      const res = await fetch(`/api/billing/products?role=${role}`);
      if (!res.ok) throw new Error('Failed to fetch billing products');
      const data = await res.json();
      return data.products;
    } catch (err) {
      // Offline / fallback products
      if (role === 'employer') {
        return [
          {
            id: 'jobready_employer_starter',
            title: 'Recruiter Starter',
            description: 'Essential toolkit for startups & direct recruiters',
            price: '₹0 / Free Trial',
            amount: 0,
            currency: 'INR',
            period: 'P1M',
            role: 'employer',
            features: [
              'Post up to 3 Active Openings',
              'Basic AI Candidate Matching',
              'Manual WhatsApp Contact Link',
              'Direct Applicant Review',
            ],
          },
          {
            id: 'jobready_employer_growth',
            title: 'Recruiter Growth & AI Match',
            description: 'Automated candidate matching and instant WhatsApp outreach dispatch',
            price: '₹1,499 / month',
            amount: 1499,
            currency: 'INR',
            period: 'P1M',
            role: 'employer',
            popular: true,
            features: [
              'Post up to 25 Active Openings',
              'Gemini AI Candidate Rank & Skill Gap Analysis',
              'Direct WhatsApp Notification Dispatch',
              '1-Click Instant Interview Invites',
              'Search Verified Candidate Talent Pool',
            ],
          },
          {
            id: 'jobready_employer_enterprise',
            title: 'Recruiter Enterprise AI',
            description: 'Unlimited high-volume hiring with bulk WhatsApp broadcasts and ATS sync',
            price: '₹4,999 / month',
            amount: 4999,
            currency: 'INR',
            period: 'P1M',
            role: 'employer',
            features: [
              'Unlimited Job Openings',
              'Bulk Automated WhatsApp Candidate Broadcasts',
              'Custom AI Screening & Evaluation Rubrics',
              'Priority Candidate Reach & SMS/WhatsApp fallback',
              'Dedicated Hiring Account Manager',
            ],
          },
        ];
      }

      return [
        {
          id: 'jobready_candidate_free',
          title: 'Candidate Basic',
          description: 'Start your career preparation journey',
          price: '₹0 / forever',
          amount: 0,
          currency: 'INR',
          period: 'P1M',
          role: 'candidate',
          features: [
            '3 AI Resume Scorecards',
            '2 Tailored Resume Versions',
            '2 Voice Mock Interviews',
            'Job Market Search Intelligence',
          ],
        },
        {
          id: 'jobready_premium_monthly',
          title: 'Candidate Pro Monthly',
          description: 'Unlimited AI tailoring, Voice Mock Interviews & WhatsApp recruiter alerts',
          price: '₹199 / month',
          amount: 199,
          currency: 'INR',
          period: 'P1M',
          role: 'candidate',
          popular: true,
          features: [
            'Unlimited AI Resume Tailoring',
            'Unlimited Gemini Voice Mock Interviews',
            'Real-time WhatsApp Job Opening Alerts',
            'Live Google Search Grounding for Salaries',
            'Direct Recruiter Matchmaking Status',
          ],
        },
        {
          id: 'jobready_premium_yearly',
          title: 'Candidate Pro Yearly',
          description: 'Best Value: 12 months of unlimited AI career advancement',
          price: '₹999 / year (Save 58%)',
          amount: 999,
          currency: 'INR',
          period: 'P1Y',
          role: 'candidate',
          features: [
            'All Pro Monthly Features',
            'VIP Candidate Badge on Recruiter Search',
            'Instant Priority WhatsApp Outreach',
            'Custom AI Career Roadmap 2026',
          ],
        },
      ];
    }
  }

  public async purchaseProduct(uid: string, productId: string): Promise<{ success: boolean; entitlement?: UserEntitlement; error?: string }> {
    try {
      // Play Store Billing client / Web payment simulation
      // Passes purchase token to trusted backend for cryptographic / server-side verification
      const simulatedPurchaseToken = `gp_token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const res = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          productId,
          purchaseToken: simulatedPurchaseToken,
          provider: 'google_play',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Purchase verification failed on server');
      }

      const data = await res.json();
      this.saveEntitlement(data.entitlement);
      return { success: true, entitlement: data.entitlement };
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment could not be completed.' };
    }
  }

  public async restorePurchases(uid: string): Promise<{ success: boolean; entitlement?: UserEntitlement; error?: string }> {
    try {
      const res = await fetch('/api/billing/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      if (!res.ok) {
        throw new Error('No active subscription found to restore');
      }

      const data = await res.json();
      this.saveEntitlement(data.entitlement);
      return { success: true, entitlement: data.entitlement };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to restore purchases.' };
    }
  }

  public getEntitlement(): UserEntitlement | null {
    if (!this.currentEntitlement) return null;
    if (this.currentEntitlement.expiryDate) {
      const expiry = new Date(this.currentEntitlement.expiryDate);
      if (expiry < new Date()) {
        // Expired
        return {
          ...this.currentEntitlement,
          status: 'EXPIRED',
        };
      }
    }
    return this.currentEntitlement;
  }

  public isPremiumActive(): boolean {
    const ent = this.getEntitlement();
    return !!(ent && ent.planId === 'PREMIUM' && ent.status === 'ACTIVE');
  }

  public cancelSubscriptionInfo(): { message: string; manageUrl: string } {
    return {
      message: 'Subscriptions are managed securely via your Google Play Account settings.',
      manageUrl: 'https://play.google.com/store/account/subscriptions',
    };
  }

  public clearEntitlement() {
    this.saveEntitlement(null);
  }
}

export const subscriptionService = new SubscriptionService();
