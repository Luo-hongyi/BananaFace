import React, { useState, useRef, useCallback, MouseEvent, TouchEvent } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string;
  aspectRatio: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage, aspectRatio }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };
  
  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    handleMove(e.clientX);
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!isDragging.current) return;
    // Prevent page scroll while dragging
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  React.useEffect(() => {
    const options = { passive: false };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Fix: The 'passive' option is part of AddEventListenerOptions, but removeEventListener's
      // type signature expects EventListenerOptions, which is stricter. Casting 'options'
      // resolves this TypeScript type mismatch.
      window.removeEventListener('touchmove', handleTouchMove, options as EventListenerOptions);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 cursor-ew-resize"
      style={{ aspectRatio }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img
        src={originalImage}
        alt="Original"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        draggable="false"
      />
      <div
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={generatedImage}
          alt="Generated"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
          draggable="false"
        />
      </div>
      <div
        className="absolute top-0 h-full w-1 bg-pink-accent/80 pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-pink-accent/80 text-white rounded-full h-9 w-9 flex items-center justify-center pointer-events-none shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
