import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageSliderProps {
  originalImage: string;
  enhancedImage: string;
  blurOriginal?: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ originalImage, enhancedImage, blurOriginal = false }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
    img.src = originalImage;
  }, [originalImage]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const onHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
  }, []);

  const onHandleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        handleMove(e.clientX);
      }
    };

    const handleWindowMouseUp = () => {
      isDragging.current = false;
    };
    
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    };
    
    const handleWindowTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [handleMove]);

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-gray-100 group"
        style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : '16/9' }}
      >
        <img
          src={enhancedImage}
          alt="Enhanced"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover"
            style={blurOriginal ? { filter: 'blur(2px)' } : undefined}
            draggable={false}
          />
        </div>
        
        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle - only this is interactive */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary/80 border border-gray-100 cursor-grab active:cursor-grabbing pointer-events-auto touch-none hover:scale-110 transition-transform"
            onMouseDown={onHandleMouseDown}
            onTouchStart={onHandleTouchStart}
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
             </svg>
          </div>
        </div>

        {/* Labels */}
         <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide pointer-events-none border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            BEFORE
        </div>
        <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide pointer-events-none border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            AFTER
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
