const { app } = require('@azure/functions');
const { getOffer } = require('../../shared/storage');
const { requireAdmin } = require('../../shared/auth');

// GET /api/internal/offers/{slug} — full OfferRecord (draft or published) for
// reopening in the review/edit form. Distinct from the public
// offersGet.js, which only ever returns the renderPayload of a *published*
// offer to unauthenticated candidates.
app.http('offersAdminGet', {
  methods: ['GET'],
  route: 'internal/offers/{slug}',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { slug } = request.params;
    const offer = await getOffer(slug);
    if (!offer) return { status: 404, jsonBody: { error: 'Oferta no encontrada.' } };
    return { jsonBody: offer };
  },
});
