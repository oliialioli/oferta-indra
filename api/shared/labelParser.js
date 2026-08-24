// Extracts structured fields from the plain text of an Indra offer letter.
//
// The letter is a fixed template with ALL-CAPS labels ("FECHA DE
// INCORPORACIÓN:", "CATEGORÍA:", ...) followed by either a blank or fixed
// boilerplate text, plus a handful of conditional clauses (shift work,
// on-call duty, canteen) that only appear in some letters. The registry
// below includes those conditional labels too, purely so their text is
// correctly excluded from the *previous* field's captured span — Phase 1
// doesn't store or expose their values yet (see PHASE1_KEYS).

const LABEL_REGISTRY = [
  { key: 'fechaIncorporacion', regex: /FECHA\s+DE\s+INCORPORACI[OÓ]N\s*:/i },
  { key: 'tipoContrato', regex: /TIPO\s+DE\s+CONTRATO\s*:/i },
  { key: 'convenioColectivo', regex: /CONVENIO\s+COLECTIVO\s*:/i },
  { key: 'categoria', regex: /CATEGOR[IÍ]A\s*:/i },
  { key: 'centroTrabajo', regex: /CENTRO\s+DE\s+TRABAJO\s*:/i },
  { key: 'periodoPrueba', regex: /PERIODO\s+DE\s+PRUEBA\s*:/i },
  { key: 'retribucionAnualBruta', regex: /RETRIBUCI[OÓ]N\s+(?:ANUAL\s+BRUTA|BRUTA\s+ANUAL)\s*:/i },
  { key: 'planRetribucionFlexible', regex: /PLAN\s+DE\s+RETRIBUCI[OÓ]N\s+FLEXIBLE\s*:/i },
  { key: 'seguroDeVida', regex: /SEGURO\s+DE\s+VIDA\s*:/i },
  { key: 'trabajoADistancia', regex: /TRABAJO\s+A\s+DISTANCIA\s*:/i },
  // Conditional clauses — boundary markers only in Phase 1, see note above.
  { key: 'plusTurnos', regex: /PLUS\s+TURNOS\s*:/i },
  { key: 'turnosRotativosMinsait', regex: /TURNOS\s+ROTATIVOS\s+MINSAIT\s*:/i },
  { key: 'turnosRotativosTyD', regex: /TURNOS\s+ROTATIVOS\s+T\s*&\s*D\s*:/i },
  { key: 'turnosRotativosMSCT', regex: /TURNOS\s+ROTATIVOS\s+MSCT\s*:/i },
  { key: 'turnosRotativosCordoba', regex: /TURNOS\s+ROTATIVOS\s+C[OÓ]RDOBA\s*:/i },
  { key: 'plusGuardias', regex: /PLUS\s+GUARDIAS\s*:/i },
  { key: 'comedorDeEmpresa', regex: /COMEDOR\s+DE\s+EMPRESA\s*:/i },
  { key: 'validezDeLaOferta', regex: /VALIDEZ\s+DE\s+LA\s+OFERTA\s*:/i },
];

// Only these are surfaced in the Phase 1 review form / OfferRecord.letter —
// the rest of LABEL_REGISTRY exists purely to bound their captured spans.
const PHASE1_KEYS = [
  'fechaIncorporacion',
  'tipoContrato',
  'convenioColectivo',
  'categoria',
  'centroTrabajo',
  'periodoPrueba',
  'retribucionAnualBruta',
];

const SPANISH_MONTHS = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

function findLabelMatches(text) {
  const matches = [];
  for (const { key, regex } of LABEL_REGISTRY) {
    const m = regex.exec(text);
    if (m) matches.push({ key, index: m.index, endIndex: m.index + m[0].length });
  }
  matches.sort((a, b) => a.index - b.index);
  return matches;
}

// Value for each label = the text between that label and whichever label
// comes next *in this particular document* (not the next one in the
// registry) — a section absent from a given letter simply isn't matched,
// so it never wrongly bounds or gets swallowed into a neighboring capture.
function captureLabelSpans(text) {
  const matches = findLabelMatches(text);
  const spans = {};
  matches.forEach((match, i) => {
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    spans[match.key] = text.slice(match.endIndex, nextIndex).trim();
  });
  return spans;
}

function parseSpanishDate(raw) {
  if (!raw) return null;
  const numeric = raw.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/);
  if (numeric) {
    const [, day, month, year] = numeric;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const worded = raw
    .toLowerCase()
    .match(/(\d{1,2})\s*(?:de)?\s*([a-záéíóú]+)\s*(?:de)?\s*(\d{4})/);
  if (worded) {
    const [, day, monthName, year] = worded;
    const month = SPANISH_MONTHS[monthName];
    if (month) return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

function parsePeriodoPruebaMeses(raw) {
  if (!raw) return null;
  const match = raw.match(/(\d+)\s*mes/i);
  return match ? Number(match[1]) : null;
}

function parseRetribucion(raw) {
  if (!raw) return null;
  // Tolerates "32.000 €", "//32.000// €", "32.000,50 €" — thousands dot,
  // optional decimal comma, optional slash placeholders from the template.
  const match = raw.match(/(\d{1,3}(?:\.\d{3})*)(?:,(\d+))?\s*€/);
  if (!match) return null;
  const amount = Number(match[1].replace(/\./g, '')) + (match[2] ? Number(`0.${match[2]}`) : 0);
  const payFrequencyMatch = raw.match(/en\s+\d+\s+pagas/i);
  return {
    amount,
    currency: 'EUR',
    payFrequencyNote: payFrequencyMatch ? payFrequencyMatch[0] : null,
  };
}

function parseHeader(text) {
  // "XXXX XXXX    Madrid, XX de abril de 202X" on the letter's first line.
  const headerMatch = text.match(/^\s*(.+?)\s+Madrid,\s*(.+?)\s*$/im);
  const greetingMatch = text.match(/^\s*Hola\s+([^,]+),/im);
  const candidateFullName = headerMatch ? headerMatch[1].trim() : null;
  const letterDateRaw = headerMatch ? headerMatch[2].trim() : null;
  const candidateFirstName = greetingMatch
    ? greetingMatch[1].trim()
    : candidateFullName?.split(/\s+/)[0] ?? null;

  return {
    candidateFullName: fieldResult(candidateFullName, candidateFullName),
    candidateFirstName: fieldResult(candidateFirstName, candidateFirstName),
    letterDate: fieldResult(letterDateRaw, parseSpanishDate(letterDateRaw)),
  };
}

function fieldResult(raw, value) {
  const isEmpty = value === null || value === undefined || value === '';
  return {
    value: isEmpty ? null : value,
    raw: raw ?? null,
    confidence: raw == null ? 'missing' : isEmpty ? 'ambiguous' : 'matched',
  };
}

/**
 * @param {string} text plain text of the uploaded letter (already converted
 *   from .docx/.pdf — see textExtractors.js)
 * @returns {Object} one entry per PHASE1_KEYS field (+ header fields), each
 *   `{ value, raw, confidence }` — confidence is 'matched' (parsed cleanly),
 *   'ambiguous' (label found but couldn't parse the value, e.g. still a
 *   template placeholder) or 'missing' (label not found in this document).
 *   Always requires human review before publishing — see ReviewForm.jsx.
 */
function extractOfferFields(text) {
  const spans = captureLabelSpans(text);
  const header = parseHeader(text);

  return {
    ...header,
    fechaIncorporacion: fieldResult(spans.fechaIncorporacion, parseSpanishDate(spans.fechaIncorporacion)),
    tipoContrato: fieldResult(spans.tipoContrato, spans.tipoContrato || null),
    convenioColectivo: fieldResult(spans.convenioColectivo, spans.convenioColectivo || null),
    categoria: fieldResult(spans.categoria, spans.categoria || null),
    centroTrabajo: fieldResult(spans.centroTrabajo, spans.centroTrabajo || null),
    periodoPruebaMeses: fieldResult(spans.periodoPrueba, parsePeriodoPruebaMeses(spans.periodoPrueba)),
    retribucionAnualBruta: fieldResult(spans.retribucionAnualBruta, parseRetribucion(spans.retribucionAnualBruta)),
  };
}

module.exports = {
  LABEL_REGISTRY,
  PHASE1_KEYS,
  captureLabelSpans,
  parseSpanishDate,
  parsePeriodoPruebaMeses,
  parseRetribucion,
  extractOfferFields,
};
