'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Snippet {
  id: string;
  code: string;
  location: 'head' | 'body_start' | 'body_end';
}

export function CodeSnippetInjector() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip script injection on admin panel routes
    if (pathname && pathname.startsWith('/admin')) {
      return;
    }

    const loadAndInject = async () => {
      try {
        const res = await fetch('/api/snippets');
        const data = await res.json();
        if (data.success && data.snippets) {
          data.snippets.forEach((snippet: Snippet) => {
            // Guard against duplicate injections (e.g. during SPA route changes)
            if (document.querySelector(`meta[data-snippet-id="${snippet.id}"]`)) {
              return;
            }

            // Create marker element to prevent future duplicates
            const marker = document.createElement('meta');
            marker.setAttribute('data-snippet-id', snippet.id);
            marker.setAttribute('content', 'injected');

            const range = document.createRange();
            const fragment = range.createContextualFragment(snippet.code);

            if (snippet.location === 'head') {
              document.head.appendChild(marker);
              document.head.appendChild(fragment);
            } else if (snippet.location === 'body_start') {
              const firstChild = document.body.firstChild;
              document.body.insertBefore(marker, firstChild);
              document.body.insertBefore(fragment, firstChild);
            } else { // body_end
              document.body.appendChild(marker);
              document.body.appendChild(fragment);
            }
          });
        }
      } catch (err) {
        console.error('[CodeSnippetInjector] Failed to load custom snippets:', err);
      }
    };

    loadAndInject();
  }, [pathname]);

  return null;
}
