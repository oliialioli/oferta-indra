const { app } = require('@azure/functions');
const { getOffer } = require('../../shared/storage');

// GET /api/offers/{slug} — PUBLIC, no auth. Returns only the renderPayload
// of a published offer (never the full OfferRecord/letter fields) — this
// is what the candidate-facing microsite (src/data/useOfferData.js) fetches.
app.http('offersGet', {
  methods: ['GET'],
  route: 'offers/{slug}',
  authLevel: 'anonymous',
  handler: async (request) => {
    const { slug } = request.params;
    const offer = await getOffer(slug);
    if (!offer || offer.status !== 'published' || !offer.renderPayload) {
      return { status: 404, jsonBody: { error: 'Oferta no encontrada o no publicada.' } };
    }
    return { jsonBody: offer.renderPayload };
  },
});
