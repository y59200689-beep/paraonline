'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
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

    const revealElements = document.querySelectorAll(selectors);
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return null;
}
