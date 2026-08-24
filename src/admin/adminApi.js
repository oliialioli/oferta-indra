// Thin fetch wrapper for the /api/internal/offers/* endpoints — these are
// gated by Easy Auth (Entra ID) at the platform level (see
// staticwebapp.config.json), so no auth token handling is needed here;
// the browser's session cookie is enough once a staff member is logged in.

const BASE = '/api/internal/offers';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function listOffers() {
  return request('');
}

export function getOffer(slug) {
  return request(`/${encodeURIComponent(slug)}`);
}

export async function extractOffer(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/extract`, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function createOffer(payload) {
  return request('', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateOffer(slug, payload) {
  return request(`/${encodeURIComponent(slug)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function sendOfferEmail(slug) {
  return request(`/${encodeURIComponent(slug)}/send-email`, { method: 'POST' });
}
