import { useCallback, useEffect, useRef, useState } from 'react';
import { narratorSections, confirmationSection } from '../data/narratorConfig';

const SECTION_DEBOUNCE_MS = 500; // let a section actually settle in view before its audio starts (~400-600ms)
const FINISHED_HOLD_MS = 1500; // how long the "Audio finalizado" pill shows before confirmation/idle
const AUDIO_CHOICE_KEY = 'oferta-indra:audio-choice';

// The intro screen's audio choice is mandatory once per session (see
// App.jsx's useScrollLock) — reloading mid-session shouldn't ask again or
// re-lock scroll, so the choice is remembered in sessionStorage. Wrapped in
// try/catch since storage can throw in private-browsing contexts.
function readStoredAudioChoice() {
  try {
    return sessionStorage.getItem(AUDIO_CHOICE_KEY);
  } catch {
    return null;
  }
}

function writeStoredAudioChoice(value) {
  try {
    sessionStorage.setItem(AUDIO_CHOICE_KEY, value);
  } catch {
    // ignore — nothing we can do if storage is unavailable
  }
}

// The narrator's single state machine: idle | presenting | talking |
// listening | confirmation, plus a separate audioPhase that drives the
// controls: inactive | playing | paused | ended | error.
//
// Whether audio narrates at all is a one-time, explicit choice made on the
// intro screen (see AudioInviteCard.jsx) — audioDecided tracks whether
// that choice has been made yet at all, audioEnabled tracks which way it
// went. Before the choice (or if declined), entering a section never plays
// audio and Buddy just idles — no more per-section "presenting" gesture,
// which used to fire regardless of whether the visitor had ever been
// asked. Once enabled, entering a section plays straight into TALKING in
// sync with that section's real MP3 (skipping PRESENTING, which would add
// a ~5s delay before the voice starts); TALKING loops for as long as the
// audio actually plays. When it ends, a brief "finished" beat shows, then
// CONFIRMATION plays once (a nodding/acknowledging gesture — the same clip
// used when the accept modal opens, see the modalOpen effect below), then
// IDLE. Scrolling back to an already-heard section does not auto-replay
// it (see heardSectionsRef) — only the manual "Volver a escuchar" control
// does.
export function useNarrator({ activeIndex, modalOpen }) {
  // Read once, on mount, whether this session already answered the audio
  // choice — a reload shouldn't ask again or replay the greeting/re-lock
  // scroll (see App.jsx's useScrollLock, gated on !audioDecided).
  const [storedChoice] = useState(readStoredAudioChoice);
  // Starts on the one-shot greeting gesture (see narratorVideos.js) rather
  // than idle — it's the very first thing a visitor sees, before the
  // intro screen's audio choice even renders. Skipped entirely if the
  // choice was already made earlier this session.
  const [state, setState] = useState(() => (storedChoice ? 'idle' : 'greeting'));
  const [audioEnabled, setAudioEnabled] = useState(() => storedChoice === 'enabled');
  const [audioDecided, setAudioDecided] = useState(() => Boolean(storedChoice));
  const [audioPhase, setAudioPhase] = useState('inactive');
  const [justFinished, setJustFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [revealSeq, setRevealSeq] = useState(0);

  const audioRef = useRef(null);
  // useNarrator can now be called before the <audio> element it controls
  // has actually mounted (App.jsx calls it unconditionally, including
  // during useOfferData's loading state, before AvatarNarrator — and its
  // <audio ref>  — exists). A plain useRef alone gives no signal for when
  // that later mount happens, so the listener-attaching effect below would
  // run once against a null ref and never get another chance. setAudioNode
  // is the ref callback actually passed to the <audio> element; it updates
  // audioRef.current (unchanged for every other consumer that just reads
  // .current) and also flips this state so the effect re-runs once the
  // node genuinely exists, whenever that turns out to be.
  const [audioMounted, setAudioMounted] = useState(false);
  const setAudioNode = useCallback((el) => {
    audioRef.current = el;
    setAudioMounted(Boolean(el));
  }, []);
  // Section ids that have already auto-played once — scrolling back to one
  // of these doesn't restart its audio; only the manual replay control does.
  const heardSectionsRef = useRef(new Set());
  const runIdRef = useRef(0);
  const timersRef = useRef([]);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);
  const lastEnteredIndexRef = useRef(-1);
  const isFirstEntryRef = useRef(true);
  const onPresentingEndedRef = useRef(null);
  const justEndedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fallback for the greeting video ending before the debounced
  // section-entry effect below has had its own chance to wire up this
  // same handler (only matters if the clip is shorter than
  // SECTION_DEBOUNCE_MS) — without this, handleVideoEnded would fire
  // against a still-null onPresentingEndedRef and Buddy would freeze on
  // the greeting's last frame instead of settling into idle.
  useEffect(() => {
    onPresentingEndedRef.current = () => setState('idle');
  }, []);

  const section = modalOpen ? confirmationSection : narratorSections[activeIndex] ?? narratorSections[0];
  const narrationText = section.narrationText();
  const hasAudio = Boolean(section.audioSrc);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
  }, []);

  // The browser fires 'pause' as a queued task, not synchronously — see
  // onPause below, which already defers its own state update by one more
  // tick to let a same-tick 'ended' win first. cancelAll's own stopAudio()
  // races that same queued event: if the section entry that follows sets
  // state to e.g. 'ended' (re-entering an already-heard section) or
  // 'confirmation' (opening the accept modal), the *later* 'pause' event
  // would otherwise clobber it back to 'paused' a tick afterward. Flagging
  // "this pause is our own section-transition cleanup, not a user click on
  // Pausar audio" lets onPause skip its update for exactly that one event.
  const skipNextPauseEventRef = useRef(false);

  // Fully cancels whatever the previous section left running — pending
  // timers, the presenting->idle handoff, and any audio — before a new
  // section (or a manual control) takes over.
  const cancelAll = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    onPresentingEndedRef.current = null;
    setJustFinished(false);
    if (audioRef.current && !audioRef.current.paused) skipNextPauseEventRef.current = true;
    stopAudio();
  }, [clearTimers, stopAudio]);

  const playSectionAudio = useCallback((sec) => {
    const audio = audioRef.current;
    if (!audio || !sec.audioSrc) return;
    if (audio.getAttribute('src') !== sec.audioSrc) {
      audio.setAttribute('src', sec.audioSrc);
    }
    audio.currentTime = 0;
    const p = audio.play();
    if (p?.catch) p.catch(() => setAudioPhase('error'));
  }, []);

  const runSectionEntry = useCallback(
    (sec) => {
      if (audioEnabled && sec.audioSrc) {
        if (heardSectionsRef.current.has(sec.id)) {
          // Already played once on a previous visit to this section —
          // don't auto-replay on scrolling back, just surface the manual
          // "Volver a escuchar" control (same one shown after a section
          // finishes naturally).
          setAudioPhase('ended');
          setState('idle');
          return;
        }
        heardSectionsRef.current.add(sec.id);
        playSectionAudio(sec);
        return;
      }
      // No audio yet decided, declined, or this section has none —
      // Buddy just idles, no per-section gesture.
      setAudioPhase('inactive');
      setState('idle');
    },
    [audioEnabled, playSectionAudio]
  );

  // Debounced "section became active" handler — only a section that holds
  // a stable position triggers anything, so fast scrolling through several
  // sections cancels every intermediate one and only the last settles in.
  useEffect(() => {
    if (modalOpen) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (activeIndex === lastEnteredIndexRef.current) return;
      lastEnteredIndexRef.current = activeIndex;
      cancelAll();
      const sec = narratorSections[activeIndex] ?? narratorSections[0];
      if (isFirstEntryRef.current) {
        // Never autoplay audio on first load — the intro screen's own
        // audio choice (in the sticky bar) is what makes that call. The
        // one-shot greeting gesture is the exception: it's already been
        // playing since mount (see the initial state above), so leave it
        // running rather than cutting it to idle — cancelAll() just above
        // nulled its onEnded handler, so re-wire it here to settle into
        // idle once the clip actually finishes.
        isFirstEntryRef.current = false;
        setAudioPhase('inactive');
        const runId = runIdRef.current;
        onPresentingEndedRef.current = () => {
          if (runIdRef.current !== runId) return;
          setState('idle');
        };
        return;
      }
      runSectionEntry(sec);
    }, SECTION_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, modalOpen, cancelAll, runSectionEntry]);

  // Accept modal opened: the flow's "final review" moment. No recording
  // exists for it, so it's just the confirmation clip once, then idle.
  useEffect(() => {
    if (!modalOpen) return;
    cancelAll();
    const runId = runIdRef.current;
    setAudioPhase('inactive');
    setState('confirmation');
    onPresentingEndedRef.current = () => {
      if (runIdRef.current !== runId) return;
      setState('idle');
    };
  }, [modalOpen, cancelAll]);

  // A one-shot video (presenting/confirmation) finished playing.
  const handleVideoEnded = useCallback(() => {
    const cb = onPresentingEndedRef.current;
    onPresentingEndedRef.current = null;
    cb?.();
  }, []);

  const enableAudio = useCallback(() => {
    setAudioEnabled(true);
    setAudioDecided(true);
    writeStoredAudioChoice('enabled');
    cancelAll();
    lastEnteredIndexRef.current = activeIndex;
    heardSectionsRef.current.add(section.id);
    playSectionAudio(section);
  }, [cancelAll, playSectionAudio, section, activeIndex]);

  // "Ver sin audio" on the intro screen's invite card — audio stays off,
  // Buddy idles for the rest of the tour, and the choice is never asked
  // again (the invite card itself only shows while !audioDecided).
  const declineAudio = useCallback(() => {
    setAudioDecided(true);
    writeStoredAudioChoice('declined');
  }, []);

  const pauseAudio = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  const resumeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const p = audio.play();
    if (p?.catch) p.catch(() => setAudioPhase('error'));
  }, []);

  const replayAudio = useCallback(() => {
    if (!hasAudio) return;
    cancelAll();
    playSectionAudio(section);
  }, [hasAudio, cancelAll, playSectionAudio, section]);

  // Mutes/unmutes the element itself — playback and transcript progress
  // are untouched, unlike the old full opt-out.
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  // Shared <audio> element's own events are the source of truth for
  // talking/listening/idle and for what the controls show.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => {
      justEndedRef.current = false;
      setAudioPhase('playing');
      setJustFinished(false);
      setState('talking');
      setRevealSeq((n) => n + 1);
    };
    const onEnded = () => {
      justEndedRef.current = true;
      setAudioPhase('ended');
      setJustFinished(true);
      setState('idle');
      const runId = runIdRef.current;
      schedule(() => {
        setJustFinished(false);
        setState('confirmation');
        onPresentingEndedRef.current = () => {
          if (runIdRef.current !== runId) return;
          setState('idle');
        };
      }, FINISHED_HOLD_MS);
    };
    const onPause = () => {
      if (skipNextPauseEventRef.current) {
        skipNextPauseEventRef.current = false;
        return;
      }
      // A natural finish fires 'pause' then 'ended' (order varies by
      // browser) — defer one tick so 'ended' has a chance to claim it
      // first; otherwise this would flash IDLE/paused before the real
      // finished sequence.
      setTimeout(() => {
        if (justEndedRef.current || audio.ended) return;
        setAudioPhase('paused');
        setState('idle');
      }, 0);
    };
    const onError = () => {
      setAudioPhase('error');
      setJustFinished(false);
      setState('idle');
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
    // audioMounted intentionally included — see setAudioNode above.
  }, [schedule, audioMounted]);

  // Tab hidden -> pause narration; tab visible again -> resume only if it
  // was actually playing before (never auto-starts audio on its own).
  const wasAudioPlayingRef = useRef(false);
  useEffect(() => {
    function onVisibility() {
      const audio = audioRef.current;
      if (document.hidden) {
        wasAudioPlayingRef.current = audioPhase === 'playing';
        if (audio && !audio.paused) audio.pause();
      } else if (wasAudioPlayingRef.current && audio) {
        const p = audio.play();
        if (p?.catch) p.catch(() => {});
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [audioPhase]);

  return {
    state,
    narrationText,
    sectionId: section.id,
    hasAudio,
    audioRef,
    setAudioNode,
    audioEnabled,
    audioDecided,
    audioPhase,
    justFinished,
    muted,
    enableAudio,
    declineAudio,
    pauseAudio,
    resumeAudio,
    replayAudio,
    toggleMute,
    handleVideoEnded,
    revealSeq,
  };
}
