const { app } = require('@azure/functions');
const { extractText } = require('../../shared/textExtractors');
const { extractOfferFields } = require('../../shared/labelParser');
const { uploadSourceDocument } = require('../../shared/blobStorage');
const { requireAdmin } = require('../../shared/auth');

// POST /api/internal/offers/extract — internal staff only (Easy Auth + the
// requireAdmin defense-in-depth check). Accepts a multipart file upload,
// stores the original in Blob Storage, and runs the label-based extraction
// from labelParser.js. Never publishes anything — the caller (ReviewForm)
// always shows the result for human review/edit first.
app.http('offersExtract', {
  methods: ['POST'],
  route: 'internal/offers/extract',
  authLevel: 'anonymous',
  handler: async (request) => {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return { status: 400, jsonBody: { error: 'Falta el archivo.' } };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileType, text } = await extractText(buffer);
    if (!fileType) {
      return {
        status: 400,
        jsonBody: {
          error:
            'Formato no soportado. Solo se admiten archivos .docx o .pdf. Si el documento está en formato .doc antiguo, ábrelo en Word y guárdalo como .docx antes de subirlo.',
        },
      };
    }

    const extraction = extractOfferFields(text);
    const sourceDocBlobUrl = await uploadSourceDocument(`tmp-${Date.now()}`, file.name, buffer);

    return { jsonBody: { extraction, sourceDocBlobUrl } };
  },
});
