// Fixed, company-wide policy text — identical across every offer, unlike
// api/shared/labelParser.js's fields which vary per candidate. Mirrors
// src/data/offerData.js's current `stats` boilerplate verbatim, seeded into
// every new OfferRecord (see offers-create) and editable per-offer only if
// a future policy exception ever requires it.

const defaultBoilerplateStats = {
  planRetribucionFlexible: {
    value: 'Plan Reflex',
    detail:
      'El Plan Reflex te permite destinar parte de tu retribución a productos como seguro médico, tarjeta restaurante, tickets guardería, tarjeta transporte, plan de pensiones o formación individual.',
  },
  seguroDeVida: {
    value: 'Estarás protegido desde el primer día',
    detail:
      'Estarás incluido en la póliza colectiva de la compañía, suscrita con una aseguradora externa: fallecimiento e incapacidad permanente absoluta (capital asegurado), fallecimiento por accidente (2×) y fallecimiento por accidente de circulación (3×). El capital asegurado equivale a tu salario bruto fijo anual, redondeado por exceso a tramos de 3.006 €.',
  },
  teletrabajo: {
    value: 'Acuerdo disponible desde tu incorporación',
    detail:
      'En el momento de tu incorporación podrás suscribir un acuerdo de prestación de servicios a distancia, según el programa de teletrabajo vigente en la compañía.',
  },
};

module.exports = { defaultBoilerplateStats };
