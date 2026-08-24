// Content that's identical across every generated offer — marketing copy,
// benefit/sector arrays, bundled badge images. None of this carries
// personal data, so unlike `candidate`/`stats` (which come per-offer from
// the API — see useOfferData.js) it stays a plain static module, imported
// and bundled at build time exactly like before.
//
// Every screen's copy (eyebrow, title, narrated body, secondary/closing
// text) is resolved from the single centralized source in
// narratorConfig.js — see buildScreens() below — so nothing is duplicated
// or can drift out of sync between what Buddy narrates and what's shown
// on screen.

import topEmployerSeal from '../assets/images/top-employer-seal.png';
import linkedinTopCompaniesSeal from '../assets/images/linkedin-top-companies-seal.png';
import { narratorSections } from './narratorConfig';

const SECTION_ORDER = ['intro', 'details', 'benefits', 'topEmployer', 'sectors'];

const topEmployerBadges = [
  { src: topEmployerSeal, alt: 'Sello Top Employer España' },
  { src: linkedinTopCompaniesSeal, alt: 'Sello LinkedIn Top Companies España' },
];

export function buildScreens(candidate) {
  return Object.fromEntries(
    SECTION_ORDER.map((screenKey, i) => {
      const section = narratorSections[i];
      const resolved = {
        eyebrowLines: section.eyebrowLines(candidate),
        headline: section.title(),
        body: section.narrationText(),
        secondaryText: section.secondaryText ? section.secondaryText() : null,
        closingText: section.closingText ? section.closingText() : null,
        wordTimestamps: section.wordTimestamps,
      };
      if (screenKey === 'topEmployer') resolved.badges = topEmployerBadges;
      return [screenKey, resolved];
    })
  );
}

export const benefits = [
  {
    title: 'Cuidamos de las personas',
    body: 'Flexibilidad, conciliación, apoyo emocional y una experiencia pensada para ayudarte a dar lo mejor de ti.',
    icon: 'emotional',
  },
  {
    title: 'Más tranquilidad para tu día a día',
    body: 'Beneficios para optimizar tu compensación, favorecer el ahorro y protegerte en diferentes momentos vitales.',
    icon: 'financial',
  },
  {
    title: 'Crece a tu manera',
    body: 'Formación, aprendizaje continuo y oportunidades para desarrollar nuevas capacidades a lo largo de tu carrera.',
    icon: 'growth',
  },
  {
    title: 'Tu salud también es importante',
    body: 'Programas de salud, prevención y actividad física para ayudarte a mantener hábitos saludables.',
    icon: 'physical',
  },
  {
    title: 'Contribuye a algo más grande',
    body: 'Iniciativas sociales, medioambientales y de voluntariado con impacto dentro y fuera de la compañía.',
    icon: 'impact',
  },
  {
    title: 'Beneficios para cada día',
    body: 'Descuentos, acuerdos y ventajas exclusivas para profesionales de Indra Group.',
    icon: 'perks',
  },
];

export const reasons = [
  {
    title: 'Impulsamos el desarrollo profesional',
    body: 'Oportunidades para evolucionar y construir una carrera con impacto.',
  },
  {
    title: 'Apostamos por el aprendizaje continuo',
    body: 'Acceso a formación, conocimiento y nuevas experiencias.',
  },
  {
    title: 'Crecemos en un entorno diverso e inclusivo',
    body: 'Una cultura donde cada persona puede aportar, desarrollarse y sentirse parte.',
  },
  {
    title: 'Ponemos a las personas en el centro',
    body: 'Una experiencia basada en la escucha, el bienestar y la flexibilidad.',
  },
  {
    title: 'Innovación, tecnología e impacto real',
    body: 'Proyectos que transforman sectores clave y contribuyen a construir el futuro.',
  },
];

// Pending validation by Marketing — figures/labels below, not the section
// copy or narration, which are final per the content brief.
export const sectors = [
  {
    stat: '+20.500 M€',
    label: 'En cartera de proyectos',
    desc: 'La confianza de nuestros clientes nos sitúa en una cartera histórica de proyectos.',
  },
  {
    stat: '+58%',
    label: 'De crecimiento en contratación',
    desc: 'Ampliamos capacidades para afrontar los grandes programas tecnológicos e industriales de los próximos años.',
  },
  {
    stat: '+30%',
    label: 'De crecimiento en ingresos',
    desc: 'Un crecimiento sostenido que nos permite seguir invirtiendo en innovación, talento y desarrollo.',
  },
  {
    stat: 'Sectores que construyen el futuro',
    label: 'Defensa · Espacio · Tráfico aéreo · Movilidad · Tecnologías digitales',
    desc: 'Ámbitos estratégicos que impulsan la seguridad, la conectividad y el desarrollo tecnológico de la sociedad.',
  },
  {
    stat: 'Innovación a gran escala',
    label: 'Más de 7.000 M€ de ingresos previstos para 2026',
    desc: 'Reforzamos nuestras capacidades tecnológicas e industriales para liderar los grandes retos del futuro.',
  },
  {
    stat: 'Una misión compartida',
    label: 'Colaboración, confianza y excelencia',
    desc: 'Las grandes transformaciones solo son posibles cuando trabajamos juntos con un propósito común.',
  },
];

// Local-dev fallback so `npm run dev` still shows something meaningful
// without the API running — used by useOfferData.js only when
// import.meta.env.DEV and no slug is present in the URL.
export const devFixtureOffer = {
  candidate: { name: 'Raquel', role: 'CNS Training Instructor', company: 'Indra Group', avatarName: 'Buddy' },
  offerExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  stats: [
    { label: 'FECHA DE INCORPORACIÓN', value: '16/10/2026' },
    { label: 'TIPO DE CONTRATO', value: 'Indefinido' },
    { label: 'PERIODO DE PRUEBA', value: '6 MESES' },
    {
      label: 'RETRIBUCIÓN FLEXIBLE',
      value: 'Plan Reflex',
      detail:
        'El Plan Reflex te permite destinar parte de tu retribución a productos como seguro médico, tarjeta restaurante, tickets guardería, tarjeta transporte, plan de pensiones o formación individual.',
    },
    { label: 'RETRIBUCIÓN BRUTA ANUAL', value: '32.000€ en 14 pagas' },
    {
      label: 'TELETRABAJO',
      value: 'Acuerdo disponible desde tu incorporación',
      detail:
        'En el momento de tu incorporación podrás suscribir un acuerdo de prestación de servicios a distancia, según el programa de teletrabajo vigente en la compañía.',
    },
    {
      label: 'SEGURO DE VIDA INCLUIDO',
      value: 'Estarás protegido desde el primer día',
      wide: true,
      detail:
        'Estarás incluido en la póliza colectiva de la compañía, suscrita con una aseguradora externa: fallecimiento e incapacidad permanente absoluta (capital asegurado), fallecimiento por accidente (2×) y fallecimiento por accidente de circulación (3×). El capital asegurado equivale a tu salario bruto fijo anual, redondeado por exceso a tramos de 3.006 €.',
    },
  ],
};
