'use client';

import { useReportWebVitals } from 'next/web-vitals';

const PUBLIC_VITALS = new Set(['LCP', 'CLS', 'INP']);

/** Reports only launch-critical public UX metrics through the existing endpoint. */
export function PublicWebVitals() {
  useReportWebVitals((metric) => {
    if (!PUBLIC_VITALS.has(metric.name) || typeof window === 'undefined') return;

    const payload = JSON.stringify({
      message: `web-vital:${metric.name}`,
      context: {
        level: 'performance',
        metricId: metric.id,
        metricName: metric.name,
        value: metric.value,
        rating: metric.rating,
        route: window.location.pathname,
        navigationType: metric.navigationType,
      },
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', new Blob([payload], { type: 'application/json' }));
      return;
    }

    void fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  });

  return null;
}
