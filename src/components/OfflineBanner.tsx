/**
 * JobReady AI - Offline Banner & Maintenance Screen
 * Handles network connection drops and maintenance mode gracefully.
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldAlert, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs sticky top-0 z-40">
      <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
      <span>No internet connection. Cached data is accessible; AI features will resume when online.</span>
    </div>
  );
};

export const MaintenanceScreen: React.FC<{ message?: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">JobReady AI is under maintenance</h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {message || 'We are currently performing scheduled system upgrades. Please check back in a few minutes.'}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 mx-auto transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Status &amp; Retry</span>
        </button>
      </div>
    </div>
  );
};
