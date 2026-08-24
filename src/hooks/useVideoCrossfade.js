import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATOR_VIDEOS, LOOPING_STATES } from '../data/narratorVideos';

export const LAYER_REF_KEYS = ['A', 'B'];

// Longer than a typical UI crossfade on purpose — the character clips are
// independently rendered, so consecutive states (e.g. greeting's last
// frame -> idle's first frame) rarely land on matching poses. A slower
// dissolve reads as an intentional transition; a snappy one reads as a
// jump cut. 220ms was too quick for that specific case.
export const CROSSFADE_MS = 450;

/**
 * Drives the two-layer video crossfade shared by AvatarNarrator.jsx (the
 * full tour character, with controls) and OnboardingBuddy.jsx (the compact
 * onboarding character, muted with no controls) — both just render
 * whatever `state` the single shared narrator state machine is in; this
 * hook owns the actual <video> elements, the crossfade timing, and the
 * one-shot/looping/talking-loop transition rules, so both call sites stay
 * in sync automatically without duplicating the tricky bits (video decode
 * timing, anticipatory swaps) in two places.
 */
export function useVideoCrossfade({ state, onOneShotEnded }) {
  const videoRefs = { A: useRef(null), B: useRef(null) };
  const frontRef = useRef('A');
  const [frontLayer, setFrontLayer] = useState('A');
  const currentSrcRef = useRef(null);
  const videoFailedRef = useRef(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Precache all character clips up front so switching state never has to
  // wait on a network fetch mid-crossfade.
  useEffect(() => {
    const links = Object.values(NARRATOR_VIDEOS).map((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = src;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((l) => l.remove());
  }, []);

  // Crossfades the back (hidden) layer in with `src`, then makes it the new
  // front. Shared by state changes (applyVideoState) and the manual
  // talking-loop restart below — both are "swap to this clip" at heart.
  const swapLayer = useCallback((src, loop) => {
    if (videoFailedRef.current) return;
    const frontKey = frontRef.current;
    const backKey = frontKey === 'A' ? 'B' : 'A';
    const el = videoRefs[backKey].current;
    if (!el) return;
    el.loop = loop;
    el.muted = true;
    if (el.getAttribute('src') !== src) el.setAttribute('src', src);
    el.currentTime = 0;
    const p = el.play();
    if (p?.catch) p.catch(() => {});

    const doFlip = () => {
      frontRef.current = backKey;
      setFrontLayer(backKey);
      window.setTimeout(() => {
        // Only pause it if it's still the (now-hidden) back layer — if
        // another state change already flipped it back to front in the
        // meantime (fast scrolling through sections), pausing it here
        // would freeze the video the user is currently looking at.
        if (frontRef.current !== frontKey) {
          videoRefs[frontKey].current?.pause();
        }
      }, CROSSFADE_MS + 60);
    };

    // Setting a new src always starts a fresh decode for THIS element, even
    // when the browser already has the bytes cached from the upfront
    // <link rel="preload"> above — decoded frames aren't shared across
    // elements. Flipping the opacity crossfade before this layer actually
    // has a frame ready to paint shows as a brief flash of the character
    // box's own background instead of a clean dissolve between the two
    // clips — readyState/'loadeddata' alone isn't a precise enough signal
    // for "there's really something to see now" (they mean "a frame is
    // decoded", not "a frame has been composited to the screen");
    // requestVideoFrameCallback is the API built specifically for that
    // distinction, used whenever the browser supports it, falling back to
    // the readyState/loadeddata approach otherwise.
    if (typeof el.requestVideoFrameCallback === 'function') {
      let flipped = false;
      const flipOnce = () => {
        if (flipped) return;
        flipped = true;
        doFlip();
      };
      el.requestVideoFrameCallback(flipOnce);
      // Still don't let it hang indefinitely if the callback never fires.
      window.setTimeout(flipOnce, 300);
    } else if (el.readyState >= 2) {
      requestAnimationFrame(doFlip);
    } else {
      let flipped = false;
      const onReady = () => {
        if (flipped) return;
        flipped = true;
        el.removeEventListener('loadeddata', onReady);
        requestAnimationFrame(doFlip);
      };
      el.addEventListener('loadeddata', onReady);
      // Don't let the crossfade hang indefinitely if loadeddata is slow
      // to fire (e.g. a throttled connection despite the preload hint).
      window.setTimeout(onReady, 250);
    }
    // videoRefs is a stable map of refs across renders; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyVideoState = useCallback(
    (nextState) => {
      if (videoFailedRef.current) return;
      const src = NARRATOR_VIDEOS[nextState] || NARRATOR_VIDEOS.idle;
      const loop = LOOPING_STATES.has(nextState);
      const frontKey = frontRef.current;

      if (currentSrcRef.current === src) {
        const el = videoRefs[frontKey].current;
        if (el) el.loop = loop;
        return;
      }
      currentSrcRef.current = src;
      swapLayer(src, loop);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swapLayer]
  );

  useEffect(() => {
    applyVideoState(state);
  }, [state, applyVideoState]);

  // TALKING keeps going for as long as the (longer) audio track plays.
  // indra-talking.mp4 is shorter than most narrations, and the browser's
  // native `loop` restarting the same element leaves a visible jump at the
  // seam, so it's looped manually instead: ~250ms before the front layer's
  // clip ends, start the back layer from 0 and crossfade — the same
  // mechanism used for state changes, just re-triggered with the same clip.
  useEffect(() => {
    if (state !== 'talking') return undefined;
    const el = videoRefs[frontRef.current].current;
    if (!el) return undefined;
    let armed = true;
    const onTimeUpdate = () => {
      if (!armed) return;
      const remaining = el.duration - el.currentTime;
      if (Number.isFinite(remaining) && remaining >= 0 && remaining <= 0.25) {
        armed = false;
        swapLayer(NARRATOR_VIDEOS.talking, false);
      }
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => el.removeEventListener('timeupdate', onTimeUpdate);
    // frontLayer intentionally included: after each manual loop swap it
    // flips, and this effect must re-attach to whichever layer is now
    // front, with a fresh "armed" guard for the next cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, frontLayer, swapLayer]);

  // One-shot clips (presenting/confirmation/greeting) used to wait for the
  // native 'ended' event before crossfading into whatever comes next — by
  // then the clip's already sitting frozen on its last frame, so the
  // dissolve blends two static frames instead of blending into motion,
  // reading as a harder cut than the CROSSFADE_MS opacity fade alone can
  // hide. Anticipating it slightly (same technique as the talking loop
  // above) starts the handoff while the outgoing clip is still playing.
  // onOneShotEnded is expected to be safely idempotent (narrator's
  // handleVideoEnded nulls its own ref after calling it), so the real
  // 'ended' event firing moments later (browsers still fire it regardless
  // of this) is just a no-op.
  useEffect(() => {
    if (state === 'talking' || LOOPING_STATES.has(state)) return undefined;
    const el = videoRefs[frontRef.current].current;
    if (!el) return undefined;
    let armed = true;
    const onTimeUpdate = () => {
      if (!armed) return;
      const remaining = el.duration - el.currentTime;
      if (Number.isFinite(remaining) && remaining >= 0 && remaining <= 0.35) {
        armed = false;
        onOneShotEnded();
      }
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => el.removeEventListener('timeupdate', onTimeUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, frontLayer, onOneShotEnded]);

  const handleEnded = useCallback(
    (e) => {
      if (e.target !== videoRefs[frontRef.current].current) return;
      onOneShotEnded();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onOneShotEnded]
  );

  const handleError = useCallback(() => {
    videoFailedRef.current = true;
    setVideoFailed(true);
  }, []);

  // Tab hidden -> pause both layers; visible again -> resume the front one.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        videoRefs.A.current?.pause();
        videoRefs.B.current?.pause();
      } else {
        const p = videoRefs[frontRef.current].current?.play();
        if (p?.catch) p.catch(() => {});
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { videoRefs, frontLayer, videoFailed, handleEnded, handleError };
}
