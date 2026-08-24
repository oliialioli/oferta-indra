// Projects a stored OfferRecord down to exactly the shape the public
// microsite needs — `candidate` + `stats`, matching src/data/offerData.js's
// current exports. The generic marketing copy (screens.*.headline/body,
// benefits, reasons, sectors) stays a frontend-only static template — see
// src/data/staticOfferData.js — so this payload never needs to carry
// marketing copy or bundled asset references (e.g. badge images).
//
// Computed once at publish time (offers-update.js) and cached on the
// OfferRecord as `renderPayload`, so the public GET /api/offers/{slug}
// endpoint is a plain read, not a recompute on every view.

function formatDateEs(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function formatRetribucion(retribucion) {
  if (!retribucion?.amount) return '';
  const formatted = retribucion.amount.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  return `${formatted}€${retribucion.payFrequencyNote ? ` ${retribucion.payFrequencyNote}` : ''}`;
}

function addDays(isoDateTime, days) {
  const date = new Date(isoDateTime);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function toFrontendPayload(offer) {
  const { letter, display, boilerplateStats } = offer;

  const candidate = {
    name: letter.candidateFirstName,
    role: display.role,
    company: 'Indra Group',
    avatarName: 'Buddy',
  };

  const stats = [
    { label: 'FECHA DE INCORPORACIÓN', value: formatDateEs(letter.fechaIncorporacion) },
    { label: 'TIPO DE CONTRATO', value: letter.tipoContrato },
    { label: 'PERIODO DE PRUEBA', value: `${letter.periodoPruebaMeses} MESES` },
    {
      label: 'RETRIBUCIÓN FLEXIBLE',
      value: boilerplateStats.planRetribucionFlexible.value,
      detail: boilerplateStats.planRetribucionFlexible.detail,
    },
    { label: 'RETRIBUCIÓN BRUTA ANUAL', value: formatRetribucion(letter.retribucionAnualBruta) },
    {
      label: 'TELETRABAJO',
      value: boilerplateStats.teletrabajo.value,
      detail: boilerplateStats.teletrabajo.detail,
    },
    {
      label: 'SEGURO DE VIDA INCLUIDO',
      value: boilerplateStats.seguroDeVida.value,
      detail: boilerplateStats.seguroDeVida.detail,
      wide: true,
    },
  ];

  // publishedAt is only set at the moment of publishing, so the expiry
  // date is fixed then too — re-publishing an edit doesn't reset the
  // candidate's original window.
  const offerExpiresAt =
    offer.publishedAt && offer.offerValidityDays ? addDays(offer.publishedAt, offer.offerValidityDays) : null;

  return { candidate, stats, offerExpiresAt };
}

module.exports = { toFrontendPayload };
