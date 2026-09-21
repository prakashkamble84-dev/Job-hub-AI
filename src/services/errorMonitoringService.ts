/**
 * JobReady AI - Crash & Error Monitoring Architecture
 * Catches client-side errors and reports them securely without sensitive user details.
 */

export const errorMonitoringService = {
  init() {
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandledrejection',
      });
    });
  },

  captureError(error: any, context?: Record<string, any>) {
    try {
      const errorName = error?.name || 'ClientError';
      const errorMessage = error?.message || String(error);
      const stack = error?.stack || undefined;

      fetch('/api/telemetry/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorName,
          errorMessage,
          stack,
          platform: 'web',
          appVersion: '1.0.0',
          context: context || {},
        }),
      }).catch(() => {
        // Silent
      });
    } catch {
      // Avoid recursive crash
    }
  },
};
