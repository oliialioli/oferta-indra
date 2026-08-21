const { app } = require('@azure/functions');
const { getOffer, putOffer } = require('../../shared/storage');
const { requireAdmin } = require('../../shared/auth');
const { toFrontendPayload } = require('../../shared/renderPayload');

// PATCH /api/internal/offers/{slug} — edits a draft's fields, and/or (when
// `publish: true` is sent) transitions it to published: stamps
// publishedAt and computes+caches the renderPayload the public viewer
// reads. Publishing is the action that makes /oferta/{slug} go live.
app.http('offersUpdate', {
  methods: ['PATCH'],
  route: 'internal/offers/{slug}',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { slug } = request.params;
    const existing = await getOffer(slug);
    if (!existing) return { status: 404, jsonBody: { error: 'Oferta no encontrada.' } };

    const body = await request.json();
    const updated = {
      ...existing,
      letter: body.letter || existing.letter,
      display: body.display || existing.display,
      boilerplateStats: body.boilerplateStats || existing.boilerplateStats,
    };

    if (body.publish) {
      updated.status = 'published';
      updated.publishedAt = new Date().toISOString();
    }

    // Recompute the cached renderPayload whenever the result is (or stays)
    // published — otherwise editing an already-live offer's fields would
    // silently go stale until the next explicit publish.
    if (updated.status === 'published') {
      updated.renderPayload = toFrontendPayload(updated);
    }

    await putOffer(updated);
    return { jsonBody: updated };
  },
});
