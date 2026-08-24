// Azure Table Storage wrapper for OfferRecord persistence. Table Storage
// only stores scalar entity properties, so the nested objects (`letter`,
// `display`, `boilerplateStats`, `renderPayload`) are JSON-stringified on
// write and parsed back on read — see toEntity/fromEntity.

const { TableClient } = require('@azure/data-tables');

const TABLE_NAME = 'offers';
const PARTITION_KEY = 'offer';

let clientPromise;

function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set — see api/local.settings.json.example');
      }
      const client = TableClient.fromConnectionString(connectionString, TABLE_NAME, {
        allowInsecureConnection: connectionString.includes('UseDevelopmentStorage=true'),
      });
      await client.createTable().catch((err) => {
        if (err.statusCode !== 409) throw err;
      });
      return client;
    })().catch((err) => {
      // Don't cache a failed connection attempt forever — see the matching
      // comment in blobStorage.js.
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

function toEntity(offer) {
  return {
    partitionKey: PARTITION_KEY,
    rowKey: offer.slug,
    status: offer.status,
    createdBy: offer.createdBy,
    createdAt: offer.createdAt,
    publishedAt: offer.publishedAt,
    emailSentAt: offer.emailSentAt || null,
    sourceDocBlobUrl: offer.sourceDocBlobUrl,
    letter: JSON.stringify(offer.letter),
    display: JSON.stringify(offer.display),
    boilerplateStats: JSON.stringify(offer.boilerplateStats),
    renderPayload: offer.renderPayload ? JSON.stringify(offer.renderPayload) : null,
  };
}

function fromEntity(entity) {
  return {
    slug: entity.rowKey,
    status: entity.status,
    createdBy: entity.createdBy,
    createdAt: entity.createdAt,
    publishedAt: entity.publishedAt,
    emailSentAt: entity.emailSentAt || null,
    sourceDocBlobUrl: entity.sourceDocBlobUrl,
    letter: JSON.parse(entity.letter),
    display: JSON.parse(entity.display),
    boilerplateStats: JSON.parse(entity.boilerplateStats),
    renderPayload: entity.renderPayload ? JSON.parse(entity.renderPayload) : null,
  };
}

async function getOffer(slug) {
  const client = await getClient();
  try {
    const entity = await client.getEntity(PARTITION_KEY, slug);
    return fromEntity(entity);
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

async function putOffer(offer) {
  const client = await getClient();
  await client.upsertEntity(toEntity(offer), 'Replace');
  return offer;
}

async function listOffers() {
  const client = await getClient();
  const offers = [];
  const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` } });
  for await (const entity of entities) {
    offers.push(fromEntity(entity));
  }
  return offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { getOffer, putOffer, listOffers };
