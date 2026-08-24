const { app } = require('@azure/functions');
const { putOffer } = require('../../shared/storage');
const { requireAdmin, getClientPrincipal } = require('../../shared/auth');
const { defaultBoilerplateStats } = require('../../shared/companyBoilerplate');
const { slugify } = require('../../shared/slug');

// POST /api/internal/offers — persists a new draft OfferRecord from the
// reviewed/edited extraction form. Never sets status to 'published' itself
// — that only happens via offersUpdate.js's explicit publish action.
app.http('offersCreate', {
  methods: ['POST'],
  route: 'internal/offers',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;
    const principal = getClientPrincipal(request);

    const body = await request.json();
    if (!body?.letter?.candidateFullName || !body?.display?.role) {
      return {
        status: 400,
        jsonBody: { error: 'Faltan campos obligatorios: nombre del candidato y puesto a mostrar.' },
      };
    }

    const now = new Date().toISOString();
    const offer = {
      slug: body.slug?.trim() || slugify(body.letter.candidateFullName),
      status: 'draft',
      createdBy: principal.userDetails || principal.userId,
      createdAt: now,
      publishedAt: null,
      emailSentAt: null,
      sourceDocBlobUrl: body.sourceDocBlobUrl || null,
      letter: body.letter,
      display: body.display,
      boilerplateStats: body.boilerplateStats || defaultBoilerplateStats,
      renderPayload: null,
    };

    await putOffer(offer);
    return { status: 201, jsonBody: offer };
  },
});
