// Azure Blob Storage wrapper — keeps the raw uploaded offer letter, both
// for audit/re-extraction purposes and so the candidate can download the
// original document from the offer page (see offersDownloadDocument.js).
// The container stays private (no public/anonymous access) — downloads
// are always proxied through our own API, which checks the offer is
// actually published before serving anything.

const { BlobServiceClient } = require('@azure/storage-blob');

const CONTAINER_NAME = 'offer-source-documents';

const CONTENT_TYPES = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
};

let containerPromise;

function getContainer() {
  if (!containerPromise) {
    containerPromise = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set — see api/local.settings.json.example');
      }
      const service = BlobServiceClient.fromConnectionString(connectionString);
      const container = service.getContainerClient(CONTAINER_NAME);
      await container.createIfNotExists();
      return container;
    })().catch((err) => {
      // Don't cache a failed connection attempt forever — a transient
      // failure (emulator not started yet, network hiccup) would otherwise
      // permanently break every request until the process restarts.
      containerPromise = null;
      throw err;
    });
  }
  return containerPromise;
}

async function uploadSourceDocument(id, filename, buffer) {
  const container = await getContainer();
  const blobName = `${id}/${filename}`;
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer);
  return { url: blockBlob.url, blobName };
}

async function downloadSourceDocument(blobName) {
  const container = await getContainer();
  const blockBlob = container.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlob.downloadToBuffer();
  const extension = blobName.split('.').pop()?.toLowerCase();
  return {
    buffer: downloadResponse,
    contentType: CONTENT_TYPES[extension] || 'application/octet-stream',
  };
}

module.exports = { uploadSourceDocument, downloadSourceDocument };
