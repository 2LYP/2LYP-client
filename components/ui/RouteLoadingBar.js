//components/ui/RouteLoadingBar.js
"use client";

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function RouteLoadingBarInner() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const animationRef = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const duration = 800; // Animation duration in ms
    setIsLoading(true);
    setProgress(0);

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const newProgress = Math.min(elapsedTime / duration * 100, 90); // Cap at 90%

      setProgress(newProgress);

      if (newProgress < 90) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (progress >= 90) {
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 200);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 overflow-hidden">
      <div 
         className="h-full transition-all duration-200 ease-linear"
        style={{ 
          width: `${progress}%`,
          background: `linear-gradient(to right, 
            red 0% 25%, 
            #00aeef 25% 50%, 
            #1ba754 50% 75%, 
            yellow 75% 100%)`
        }}
      />
    </div>
  );
}

export default function RouteLoadingBar() {
  return (
    <Suspense fallback={null}>
      <RouteLoadingBarInner />
    </Suspense>
  );
}