'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const observedElements = new WeakSet<Element>();
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      // Start the short reveal before a section reaches the viewport. This
      // keeps scrolling fluid instead of making every section appear late.
      { threshold: 0.01, rootMargin: '420px 0px 420px 0px' }
    );

    const observeElement = (el: Element) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);
        }
    };

    const observeWithin = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(selectors)) observeElement(node);
      node.querySelectorAll(selectors).forEach(observeElement);
    };

    const observeInitialElements = () => {
      document.querySelectorAll(selectors).forEach(observeElement);
    };

    // Initial scan
    observeInitialElements();

    // Only inspect newly inserted subtrees. Re-querying document.body after
    // every React update was expensive on the catalogue and caused scroll jank.
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeWithin));
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
