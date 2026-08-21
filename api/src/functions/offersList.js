const { app } = require('@azure/functions');
const { listOffers } = require('../../shared/storage');
const { requireAdmin } = require('../../shared/auth');

// GET /api/internal/offers — summary list for the admin "offers" table, so
// staff can find and reopen anything already created (draft or published).
app.http('offersList', {
  methods: ['GET'],
  route: 'internal/offers',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const offers = await listOffers();
    const summaries = offers.map((offer) => ({
      slug: offer.slug,
      status: offer.status,
      createdAt: offer.createdAt,
      publishedAt: offer.publishedAt,
      candidateFullName: offer.letter.candidateFullName,
      role: offer.display.role,
    }));
    return { jsonBody: summaries };
  },
});
