import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reveals a screen (fade/slide in its text block + actions) the first time
 * it crosses into view, and reports which screen is "active" (closest to
 * center) so the header progress bar can track it. Mirrors the two
 * IntersectionObservers in the original vanilla-JS build.
 *
 * Observers are attached per-element inside `register` itself (not in a
 * single mount-time effect) so this works correctly even when the Screens
 * mount later than the component that calls this hook — e.g. while the
 * dynamic offer data is still loading (see useOfferData.js), the first
 * render has no <Screen> elements at all; a one-shot effect keyed on
 * mount would run before they exist and never get a chance to observe
 * them once they actually appear.
 */
export function useRevealOnScroll(screenCount) {
  const refs = useRef([]);
  const indexByEl = useRef(new Map());
  const revealObserverRef = useRef(null);
  const activeObserverRef = useRef(null);
  const [revealed, setRevealed] = useState(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  const ensureObservers = useCallback(() => {
    if (!revealObserverRef.current) {
      revealObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = indexByEl.current.get(entry.target);
              if (idx !== undefined) {
                setRevealed((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
              }
              revealObserverRef.current.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.22 }
      );
    }
    if (!activeObserverRef.current) {
      activeObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = indexByEl.current.get(entry.target);
              if (idx !== undefined) setActiveIndex(idx);
            }
          });
        },
        { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
      );
    }
  }, []);

  // Stable identity (useCallback with no deps) so React only invokes this
  // ref callback on actual mount/unmount of each <Screen>, not on every
  // re-render of the component that passes it down.
  const register = useCallback((el) => {
    ensureObservers();
    if (!el) return;
    if (!refs.current.includes(el)) refs.current.push(el);
    const idx = refs.current.indexOf(el);
    indexByEl.current.set(el, idx);
    revealObserverRef.current.observe(el);
    activeObserverRef.current.observe(el);

    // Reveal immediately if this screen mounts already on/near-screen —
    // matters for screen 0 on first load, but also for any screen that
    // could mount already in view.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      setRevealed((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureObservers]);

  // React 18 StrictMode (dev only) mounts, runs this effect's cleanup, then
  // runs the effect again — but ref callbacks like `register` above are
  // NOT re-invoked on that synthetic remount, so without this, the
  // cleanup's disconnect() would silently orphan every already-registered
  // element: the observers survive (same instances, refs aren't reset)
  // but no longer watch anything, and nothing left calls .observe() again.
  // Re-observing every known element on each (re)run — using whatever
  // `register` has already recorded in `refs.current` by the time this
  // effect runs, since ref attachment happens before effects in the same
  // commit — makes this idempotent across StrictMode's double-invoke and
  // fixes scroll tracking dying right after first mount in `npm run dev`.
  useEffect(() => {
    refs.current.forEach((el) => {
      revealObserverRef.current?.observe(el);
      activeObserverRef.current?.observe(el);
    });
    return () => {
      revealObserverRef.current?.disconnect();
      activeObserverRef.current?.disconnect();
    };
  }, []);

  const scrollToNext = useCallback((index) => {
    const next = refs.current[index + 1];
    if (next) {
      setRevealed((prev) => new Set(prev).add(index + 1));
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // No need to touch `revealed` here — a previous screen was already
  // revealed on the way past it, and its fade-in only ever plays once.
  const scrollToPrev = useCallback((index) => {
    const prev = refs.current[index - 1];
    if (prev) prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return { register, revealed, activeIndex, scrollToNext, scrollToPrev };
}
