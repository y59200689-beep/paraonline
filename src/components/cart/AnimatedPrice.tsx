'use client';

import React, { useState, useEffect, useRef } from 'react';

export const AnimatedPrice: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValue = useRef(value);

  useEffect(() => {
    const start = currentValue.current;
    const end = value;
    if (start === end) return;

    const duration = 350;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // ease out quad
      const current = start + (end - start) * ease;
      currentValue.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        currentValue.current = end;
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue.toFixed(2)} DH</span>;
};
