/**
 * JobReady AI - Subscription & Entitlement Context
 * Integrates billing products, purchase flows, usage limits, and paywall popups.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserEntitlement, UserUsage, PlanConfig } from '../types';
import { subscriptionService, type SubscriptionProduct } from '../services/subscriptionService';
import { entitlementService, type FeatureUsageStatus } from '../services/entitlementService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  entitlement: UserEntitlement | null;
  isPremium: boolean;
  products: SubscriptionProduct[];
  usage: UserUsage;
  loading: boolean;
  purchaseProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  showUpgradeModal: boolean;
  upgradeSource: string;
  openUpgradeModal: (source?: string) => void;
  closeUpgradeModal: () => void;
  checkFeatureAccess: (checkFn: () => FeatureUsageStatus) => boolean;
  limits: PlanConfig['limits'];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(subscriptionService.getEntitlement());
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [usage, setUsage] = useState<UserUsage>(entitlementService.getUsage());
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState('direct');

  useEffect(() => {
    const unsubSub = subscriptionService.subscribe((newEnt) => {
      setEntitlement(newEnt);
    });
    const unsubUsage = entitlementService.subscribeUsage((newUsage) => {
      setUsage({ ...newUsage });
    });

    subscriptionService.getProducts().then(setProducts);

    return () => {
      unsubSub();
      unsubUsage();
    };
  }, []);

  const openUpgradeModal = (source = 'direct') => {
    setUpgradeSource(source);
    setShowUpgradeModal(true);
    analyticsService.trackPremiumScreenViewed(source);
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  const purchaseProduct = async (productId: string) => {
    if (!user) return { success: false, error: 'Please sign in first' };
    setLoading(true);
    analyticsService.trackPurchaseStarted(productId);

    const result = await subscriptionService.purchaseProduct(user.uid, productId);
    setLoading(false);

    if (result.success && result.entitlement) {
      analyticsService.trackPurchaseCompleted(productId);
      setShowUpgradeModal(false);
      return { success: true };
    } else {
      analyticsService.trackPurchaseFailed(productId, result.error || 'Payment failed');
      return { success: false, error: result.error };
    }
  };

  const restorePurchases = async () => {
    if (!user) return { success: false, error: 'Please sign in first' };
    setLoading(true);
    const result = await subscriptionService.restorePurchases(user.uid);
    setLoading(false);
    if (result.success) {
      analyticsService.trackSubscriptionRestored();
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const checkFeatureAccess = (checkFn: () => FeatureUsageStatus): boolean => {
    const status = checkFn();
    if (!status.allowed) {
      openUpgradeModal(`limit_reached_${status.featureName}`);
      return false;
    }
    return true;
  };

  const isPremium = !!(entitlement && entitlement.planId === 'PREMIUM' && entitlement.status === 'ACTIVE');

  return (
    <SubscriptionContext.Provider
      value={{
        entitlement,
        isPremium,
        products,
        usage,
        loading,
        purchaseProduct,
        restorePurchases,
        showUpgradeModal,
        upgradeSource,
        openUpgradeModal,
        closeUpgradeModal,
        checkFeatureAccess,
        limits: entitlementService.getActiveLimits(),
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return context;
};
