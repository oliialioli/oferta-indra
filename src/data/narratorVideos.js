import idleVideo from '../assets/media/indra-idle.mp4';
import talkingVideo from '../assets/media/indra-talking.mp4';
import presentingVideo from '../assets/media/indra-presenting.mp4';
import listeningVideo from '../assets/media/indra-listening.mp4';
import confirmationVideo from '../assets/media/indra-confirmation.mp4';

// idle | talking | presenting | listening | confirmation
export const NARRATOR_VIDEOS = {
  idle: idleVideo,
  talking: talkingVideo,
  presenting: presentingVideo,
  listening: listeningVideo,
  confirmation: confirmationVideo,
};

// presenting/confirmation play once and report back via onEnded. idle and
// listening use the browser's native loop. talking is NOT here even though
// it's a looping state — it needs to keep going for as long as the (longer)
// audio track plays, and native `loop` restarting the same element leaves a
// visible jump, so it's looped manually via a two-layer crossfade instead
// (see useTalkingLoop in AvatarNarrator.jsx).
export const LOOPING_STATES = new Set(['idle', 'listening']);
