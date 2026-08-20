import welcomeAudio from '../assets/audio/indra-welcome.mp3';
import offerAudio from '../assets/audio/indra-offer.mp3';
import benefitsAudio from '../assets/audio/indra-benefits.mp3';
import topEmployerAudio from '../assets/audio/indra-top-employer.mp3';
import companyAudio from '../assets/audio/indra-company.mp3';

// Single source of truth for the narrator: which message + audio track
// plays for each scroll section. Transcripts match the recorded MP3s
// word-for-word (no name/role/salary/date — those stay in the main
// right-column content, which already renders them dynamically).

export const narratorSections = [
  {
    id: 'intro',
    message: () =>
      'Te doy la bienvenida. Antes de empezar, quiero enseñarte los puntos más importantes de tu propuesta y todo lo que puedes encontrar en este recorrido. Cuando quieras, comenzamos.',
    audioSrc: welcomeAudio,
  },
  {
    id: 'details',
    message: () =>
      'Empecemos por tu propuesta. Aquí puedes consultar las condiciones principales que hemos preparado para ti y revisar cada detalle con calma.',
    audioSrc: offerAudio,
  },
  {
    id: 'benefits',
    message: () =>
      'Además de tus condiciones, tendrás acceso a diferentes beneficios pensados para ayudarte a conciliar, seguir aprendiendo, cuidar de tu bienestar y disfrutar de nuevas oportunidades.',
    audioSrc: benefitsAudio,
  },
  {
    id: 'topEmployer',
    message: () =>
      'Nuestro compromiso con las personas se refleja en oportunidades reales de desarrollo, aprendizaje y crecimiento, así como en nuestro impulso al talento y la diversidad.',
    audioSrc: topEmployerAudio,
  },
  {
    id: 'sectors',
    message: () =>
      'En Indra trabajamos en proyectos que transforman sectores estratégicos y generan un impacto real. Ahora tú también puedes formar parte de esta misión compartida.',
    audioSrc: companyAudio,
  },
];

// Fires when the accept modal opens — the actual "final review" moment in
// this flow. No recording exists for it, so it stays a silent, text-only
// confirmation.
export const confirmationSection = {
  id: 'confirmation',
  message: () =>
    'Ya conoces los puntos principales de tu propuesta. Puedes revisarla, descargarla y aceptarla cuando estés preparada.',
  audioSrc: null,
};
