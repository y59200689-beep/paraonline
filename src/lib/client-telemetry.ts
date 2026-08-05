'use client';

type ReportedError = Error & { digest?: string };

interface ClientErrorReportOptions {
  messageFallback: string;
  componentStack?: string | null;
}

/** Sends client-rendering errors to the existing telemetry endpoint. */
export function reportClientError(error: ReportedError, options: ClientErrorReportOptions) {
  void fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message || options.messageFallback,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
      context: {
        level: 'error',
        digest: error.digest,
        componentStack: options.componentStack,
        route: typeof window !== 'undefined' ? window.location.pathname : '',
      },
    }),
  }).catch(reportingError => {
    console.error('Failed to dispatch telemetry report:', reportingError);
  });
}
