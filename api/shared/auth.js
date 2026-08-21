// Defense-in-depth for the /api/admin/* routes. Azure Static Web Apps'
// Easy Auth already blocks unauthenticated requests to these routes at the
// platform level (see staticwebapp.config.json's allowedRoles rule) before
// they ever reach the Function — this check exists so the API doesn't
// *rely solely* on that platform gate (e.g. if the config rule is ever
// misconfigured or the Function is called directly).

function getClientPrincipal(request) {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

function requireAdmin(request) {
  const principal = getClientPrincipal(request);
  if (!principal?.userId) {
    return { status: 401, jsonBody: { error: 'No autenticado.' } };
  }
  return null;
}

module.exports = { getClientPrincipal, requireAdmin };
