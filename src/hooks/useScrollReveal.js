//hooks/useScrollReveal.js

import { useCallback, useEffect, useState } from "react";

export default function useScrollReveal() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tokenBoxReveal, setTokenBoxReveal] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 300);
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight ? scrollY / docHeight : 0;
    setScrollProgress(progress);

    const revealStart = 0.85;
    if (progress > revealStart) {
      setTokenBoxReveal(Math.min(1, (progress - revealStart) / (1 - revealStart)));
    } else {
      setTokenBoxReveal(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { isScrolled, scrollProgress, tokenBoxReveal };
}
