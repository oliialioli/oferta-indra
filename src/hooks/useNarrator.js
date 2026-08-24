import { useCallback, useEffect, useRef, useState } from 'react';
import { narratorSections, confirmationSection } from '../data/narratorConfig';

const SECTION_DEBOUNCE_MS = 220; // "stable presence in the viewport" before a section counts as active
const FINISHED_HOLD_MS = 1500; // how long the "Audio finalizado" pill shows before confirmation/idle

// The narrator's single state machine: idle | presenting | talking |
// listening | confirmation, plus a separate audioPhase that drives the
// controls: inactive | playing | paused | ended | error.
//
// Rule of thumb: with audio OFF, entering a section plays PRESENTING once
// and settles to IDLE — no talking, since there's nothing being said. With
// audio ON, entering a section skips PRESENTING entirely (it would add a
// ~5s delay before the voice starts) and goes straight to TALKING in sync
// with that section's real MP3; TALKING loops for as long as the audio
// actually plays. When it ends, a brief "finished" beat shows, then
// CONFIRMATION plays once (a nodding/acknowledging gesture — the same clip
// used when the accept modal opens, see the modalOpen effect below), then
// IDLE.
export function useNarrator({ activeIndex, modalOpen }) {
  const [state, setState] = useState('idle');
  const [audioEnabled, setAudioEnabled] = useState(false);
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

  // Fully cancels whatever the previous section left running — pending
  // timers, the presenting->idle handoff, and any audio — before a new
  // section (or a manual control) takes over.
  const cancelAll = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    onPresentingEndedRef.current = null;
    setJustFinished(false);
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
    (sec, runId) => {
      if (audioEnabled && sec.audioSrc) {
        playSectionAudio(sec);
        return;
      }
      setAudioPhase('inactive');
      setState('presenting');
      onPresentingEndedRef.current = () => {
        if (runIdRef.current !== runId) return;
        setState('idle');
      };
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
      const runId = runIdRef.current;
      const sec = narratorSections[activeIndex] ?? narratorSections[0];
      if (isFirstEntryRef.current) {
        // Never autoplay anything (video or audio) on first load.
        isFirstEntryRef.current = false;
        setState('idle');
        setAudioPhase('inactive');
        return;
      }
      runSectionEntry(sec, runId);
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
    cancelAll();
    lastEnteredIndexRef.current = activeIndex;
    playSectionAudio(section);
  }, [cancelAll, playSectionAudio, section, activeIndex]);

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
    audioPhase,
    justFinished,
    muted,
    enableAudio,
    pauseAudio,
    resumeAudio,
    replayAudio,
    toggleMute,
    handleVideoEnded,
    revealSeq,
  };
}
