import { useEffect, useRef, useState } from 'react';

/**
 * Reveals a screen (fade/slide in its text block + actions) the first time
 * it crosses into view, and reports which screen is "active" (closest to
 * center) so the header progress bar can track it. Mirrors the two
 * IntersectionObservers in the original vanilla-JS build.
 */
export function useRevealOnScroll(screenCount) {
  const refs = useRef([]);
  const [revealed, setRevealed] = useState(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  refs.current = [];
  const register = (el) => {
    if (el && !refs.current.includes(el)) refs.current.push(el);
  };

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.current.indexOf(entry.target);
            setRevealed((prev) => {
              if (prev.has(idx)) return prev;
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22 }
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.current.indexOf(entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
    );

    refs.current.forEach((el) => {
      revealObserver.observe(el);
      activeObserver.observe(el);
    });

    // Reveal the first screen immediately if it's already on screen at load.
    if (refs.current[0]) {
      const rect = refs.current[0].getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        setRevealed((prev) => new Set(prev).add(0));
      }
    }

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenCount]);

  const scrollToNext = (index) => {
    const next = refs.current[index + 1];
    if (next) {
      setRevealed((prev) => new Set(prev).add(index + 1));
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return { register, revealed, activeIndex, scrollToNext };
}
