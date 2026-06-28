'use client';

import React, { useRef, useState } from 'react';

interface MagneticProps {
  children: React.ReactElement;
  range?: number; // Distance threshold to track
  strength?: number; // How strongly it pulls (0 to 1)
}

export const Magnetic: React.FC<MagneticProps> = ({ 
  children, 
  range = 45, 
  strength = 0.28 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // If mouse is within the active magnetic field range
    if (distance < range) {
      // Calculate spring coordinates pull
      const pullX = distanceX * strength;
      const pullY = distanceY * strength;
      
      // Limit pull displacement for subtle, luxury feel
      const maxPull = 12;
      const limitedX = Math.max(-maxPull, Math.min(maxPull, pullX));
      const limitedY = Math.max(-maxPull, Math.min(maxPull, pullY));

      setPosition({ x: limitedX, y: limitedY });
    } else {
      // Ease back to center
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    // Smooth reset position
    setPosition({ x: 0, y: 0 });
  };

  // Clone child element and inject tracking style properties
  const child = React.Children.only(children) as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
  const combinedClassName = `${child.props.className || ''} transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]`;


  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      style={{ willChange: 'transform' }}
    >
      {React.cloneElement(child, {
        className: combinedClassName,
        style: {
          ...child.props.style,
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: 'transform'
        }
      })}
    </div>
  );
};
