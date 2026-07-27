'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const observedElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    );

    const selectors = [
      '.reveal-on-scroll',
      '.anim-section-header',
      '.anim-eyebrow',
      '.anim-body',
      '.anim-line-draw',
      '.anim-split-left',
      '.anim-split-right',
      '.anim-image-reveal',
      '.anim-counter',
      '.anim-heading-text',
      '.stagger-children',
    ].join(', ');

    const observeNewElements = () => {
      const revealElements = document.querySelectorAll(selectors);
      revealElements.forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
      });
    };

    // Initial scan
    observeNewElements();

    // Observe DOM mutations so dynamic imports / delayed context state components get observed as soon as they mount
    const mutationObserver = new MutationObserver(() => {
      observeNewElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}

