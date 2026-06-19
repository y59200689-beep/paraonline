'use client';

import React, { useState, useEffect } from 'react';

interface FloatingBubble {
  id: number;
  image: string;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  active: boolean;
}

export const CartBubbleCoordinator: React.FC = () => {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);

  useEffect(() => {
    const handleProductAdded = (e: Event) => {
      const customEvent = e as CustomEvent<{ image: string; clientX: number; clientY: number }>;
      const { image, clientX, clientY } = customEvent.detail;

      // 1. Locate current active destination cart icon bounds dynamically
      let cartElement = document.getElementById('desktop-cart-btn');
      
      // Fallback to mobile bottom navigation cart icon if desktop icon is hidden
      if (!cartElement || cartElement.getBoundingClientRect().width === 0) {
        cartElement = document.getElementById('mobile-cart-btn');
      }

      if (!cartElement) return;

      const rect = cartElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      // 2. Compute translation deltas from start coordinates
      const deltaX = targetX - clientX;
      const deltaY = targetY - clientY;

      const id = Date.now() + Math.random();
      
      // Spawn new bubble particle (inactive initially)
      setBubbles((prev) => [...prev, {
        id,
        image,
        startX: clientX,
        startY: clientY,
        deltaX,
        deltaY,
        active: false
      }]);

      // Trigger active transition in the next frame to trigger CSS transitions
      setTimeout(() => {
        setBubbles((prev) =>
          prev.map((b) => (b.id === id ? { ...b, active: true } : b))
        );
      }, 30);

      // Remove bubble from DOM after animation completes (800ms)
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
        
        // Dispatch absorption jiggle bounce triggers
        window.dispatchEvent(new Event('cart_icon_jiggle'));
      }, 820);
    };

    window.addEventListener('product_added_to_cart', handleProductAdded);
    return () => window.removeEventListener('product_added_to_cart', handleProductAdded);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute w-12 h-12 transition-transform duration-[800ms] ease-linear"
          style={{
            left: `${bubble.startX - 24}px`,
            top: `${bubble.startY - 24}px`,
            transform: bubble.active ? `translate3d(${bubble.deltaX}px, 0, 0)` : 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        >
          {/* Inner vertical wrapper executing orthogonal ease-in curve for a perfect parabolic arc */}
          <div
            className="w-full h-full bg-white border border-solid border-primary/20 rounded-full shadow-[0_8px_24px_rgba(236,72,153,0.18)] p-0.5 flex items-center justify-center transition-all duration-[800ms]"
            style={{
              transform: bubble.active ? `translate3d(0, ${bubble.deltaY}px, 0) scale(0.25)` : 'translate3d(0, 0, 0) scale(1)',
              opacity: bubble.active ? 0 : 1,
              transitionTimingFunction: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
              willChange: 'transform, opacity'
            }}
          >
            <img
              src={bubble.image}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
