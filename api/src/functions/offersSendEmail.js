const { app } = require('@azure/functions');
const { getOffer, putOffer } = require('../../shared/storage');
const { requireAdmin } = require('../../shared/auth');
const { sendOfferEmail } = require('../../shared/email');

// POST /api/internal/offers/{slug}/send-email — sends the "your offer is
// ready" email to the candidate. Only allowed once the offer is published
// (there's no public link to send before that). The confirm-before-send
// step lives in the admin UI (ReviewForm.jsx's dialog) — this endpoint
// itself sends immediately on request, no further confirmation here.
app.http('offersSendEmail', {
  methods: ['POST'],
  route: 'internal/offers/{slug}/send-email',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { slug } = request.params;
    const offer = await getOffer(slug);
    if (!offer) return { status: 404, jsonBody: { error: 'Oferta no encontrada.' } };
    if (offer.status !== 'published') {
      return { status: 400, jsonBody: { error: 'La oferta debe estar publicada antes de enviar el email.' } };
    }
    if (!offer.letter.candidateEmail) {
      return { status: 400, jsonBody: { error: 'Falta el email del candidato en los datos de la oferta.' } };
    }

    const offerUrl = `${new URL(request.url).origin}/oferta/${slug}`;

    try {
      await sendOfferEmail({
        candidateEmail: offer.letter.candidateEmail,
        candidateFirstName: offer.letter.candidateFirstName,
        offerUrl,
      });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_CONFIGURED') {
        return {
          status: 501,
          jsonBody: {
            error:
              'El envío de email todavía no está configurado (falta la dirección remitente verificada en Azure Communication Services).',
          },
        };
      }
      throw err;
    }

    const updated = { ...offer, emailSentAt: new Date().toISOString() };
    await putOffer(updated);
    return { jsonBody: updated };
  },
});
