import welcomeAudio from '../assets/audio/indra-welcome.mp3';
import offerAudio from '../assets/audio/indra-offer.mp3';
import benefitsAudio from '../assets/audio/indra-benefits.mp3';
import topEmployerAudio from '../assets/audio/indra-top-employer.mp3';
import companyAudio from '../assets/audio/indra-company.mp3';

// Single centralized source of truth for every section's content — both
// what Buddy narrates (audioSrc + narrationText, highlighted karaoke-style
// in sync with the audio, see NarratedText.jsx) and the surrounding
// on-screen copy (eyebrowLines, secondaryText, closingText), so nothing is
// duplicated across components. Per section 11 of the content brief:
// narrationText/audioSrc/wordTimestamps is the narrated content; eyebrow/
// secondary/closing text is personalized or corporate copy that must never
// be narrated (personal data — name, role, dates, salary — can never be
// part of a fixed pre-recorded audio track).
//
// wordTimestamps: null everywhere for now — no per-word timing data exists
// yet. NarratedText.jsx falls back to a proportional currentTime/duration
// estimate when this is null; once real timestamps are extracted from the
// audio files, drop them in here (one array of second-offsets, one entry
// per word in narrationText) and the highlight becomes exact, no other
// code needs to change.

// Easy to bump in one place when the award year changes.
export const TOP_EMPLOYER_YEAR = '2026';

export const narratorSections = [
  {
    id: 'intro',
    eyebrowLines: (candidate) => [`TU PROPUESTA · ${candidate.role.toUpperCase()}`],
    title: (candidate) => `${candidate.name}, tu próxima misión puede comenzar aquí.`,
    narrationText: () =>
      '¡Hola! Te damos la bienvenida. En este espacio podrás conocer tu propuesta y descubrir todo lo que Indra Group pone a tu disposición para crecer, aprender y generar un impacto real.',
    secondaryText: () => 'Aquí encontrarás toda la información necesaria para tomar tu decisión con confianza.',
    // No closingText here — reserved for the actual closing (confirmationSection,
    // topEmployer), not the intro.
    audioSrc: welcomeAudio,
    wordTimestamps: null,
  },
  {
    id: 'details',
    eyebrowLines: (candidate) => [`TU PROPUESTA · ${candidate.role.toUpperCase()}`],
    title: () => 'Tu propuesta para unirte a Indra Group',
    narrationText: () =>
      'Este puede ser el primer paso de una experiencia profesional en la que podrás crecer, aprender y contribuir a proyectos que generan un impacto real.',
    audioSrc: offerAudio,
    wordTimestamps: null,
  },
  {
    id: 'benefits',
    eyebrowLines: (candidate) => [candidate.role.toUpperCase()],
    title: () => 'Todo para crecer, cuidarte y disfrutar del camino',
    narrationText: () =>
      'Entendemos el bienestar de forma integral. Por eso, ponemos a tu disposición beneficios y programas pensados para apoyar tu desarrollo, tu salud, tu bienestar personal y tu seguridad financiera.',
    audioSrc: benefitsAudio,
    wordTimestamps: null,
  },
  {
    id: 'topEmployer',
    eyebrowLines: () => [`TOP EMPLOYER · LINKEDIN TOP COMPANIES ${TOP_EMPLOYER_YEAR}`],
    title: () => 'Un lugar donde las personas pueden crecer',
    narrationText: () =>
      'Estos reconocimientos reflejan nuestro compromiso con las personas y con una experiencia profesional que impulsa el crecimiento, el aprendizaje y las oportunidades a largo plazo.',
    closingText: () => ['¿Te unes a construir el futuro con nosotros?', 'Together, One Mission.'],
    audioSrc: topEmployerAudio,
    wordTimestamps: null,
  },
  {
    id: 'sectors',
    eyebrowLines: (candidate) => [candidate.role.toUpperCase()],
    title: () => 'Tu trabajo puede generar impacto real',
    narrationText: () =>
      'Trabajamos en sectores clave para la seguridad, la movilidad y el desarrollo tecnológico de la sociedad. Tu talento también puede contribuir a construir el futuro.',
    audioSrc: companyAudio,
    wordTimestamps: null,
  },
];

// Fires when the accept modal opens — the actual "final review" moment in
// this flow. No recording exists for it, so it stays a silent, text-only
// confirmation (AcceptModal.jsx renders this directly, not through Screen).
export const confirmationSection = {
  id: 'confirmation',
  eyebrowLines: (candidate) => [`${candidate.name.toUpperCase()}, YA CASI ESTÁ TODO LISTO`],
  title: () => 'El siguiente paso comienza aquí',
  narrationText: () =>
    'Ya casi estamos listos para comenzar. Revisa tu propuesta y, cuando quieras, da el siguiente paso. Estamos deseando darte la bienvenida a Indra Group.',
  instructionsText: () => 'Descarga y firma el documento de aceptación para completar el proceso.',
  closingText: () => ['Together, One Mission.'],
  audioSrc: null,
  wordTimestamps: null,
};
