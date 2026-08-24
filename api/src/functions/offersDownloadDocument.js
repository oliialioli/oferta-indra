const { app } = require('@azure/functions');
const { getOffer } = require('../../shared/storage');
const { downloadSourceDocument } = require('../../shared/blobStorage');

// GET /api/offers/{slug}/document — PUBLIC, no auth. Lets the candidate
// download the original offer letter from the "Descargar y firmar
// aceptación" button (AcceptModal.jsx). The source document lives in a
// private Blob container — this proxies the download through our own API
// (rather than handing out a direct blob URL) so we can check the offer
// is actually published before serving anything.
app.http('offersDownloadDocument', {
  methods: ['GET'],
  route: 'offers/{slug}/document',
  authLevel: 'anonymous',
  handler: async (request) => {
    const { slug } = request.params;
    const offer = await getOffer(slug);
    if (!offer || offer.status !== 'published' || !offer.sourceDocBlobName) {
      return { status: 404, jsonBody: { error: 'Documento no disponible.' } };
    }

    const { buffer, contentType } = await downloadSourceDocument(offer.sourceDocBlobName);
    const fileName = offer.sourceDocFileName || 'oferta';

    return {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
      body: buffer,
    };
  },
});
