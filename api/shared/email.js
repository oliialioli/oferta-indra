// Sends the "your offer is ready" email via Azure Communication Services
// Email, from a shared sender address (e.g. ofertas@indra.es) rather than
// a staff member's personal mailbox — see offersSendEmail.js for the
// confirm-before-send flow this backs.
//
// Requires AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING and
// AZURE_COMMUNICATION_EMAIL_SENDER (the verified sender address) to be
// set — see api/local.settings.json.example. Until Indra provisions and
// verifies a sending domain in Azure Communication Services, those won't
// be configured; sendOfferEmail then throws EMAIL_NOT_CONFIGURED so the
// rest of the publish/review flow can still be demoed without a real send.

const { EmailClient } = require('@azure/communication-email');

let clientPromise;

function getClient() {
  if (!clientPromise) {
    const connectionString = process.env.AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING;
    if (!connectionString) {
      const err = new Error('EMAIL_NOT_CONFIGURED');
      err.code = 'EMAIL_NOT_CONFIGURED';
      throw err;
    }
    clientPromise = new EmailClient(connectionString);
  }
  return clientPromise;
}

// Table-based, inline-styled markup on purpose — this has to render
// correctly in Outlook desktop and Gmail, neither of which reliably
// supports modern CSS (flexbox, custom fonts, box-shadow, etc.), so it
// approximates the site's branding (dark card, framed avatar, eyebrow +
// headline + CTA) rather than reusing any of the app's own components.
function offerEmailHtml({ candidateFirstName, role, offerUrl, avatarUrl }) {
  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#001820;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#001820;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#002532;">
            <tr>
              <td align="center" style="padding: 32px 32px 8px;">
                <img
                  src="${avatarUrl}"
                  width="140"
                  alt="Tu guía en Indra Group"
                  style="display:block; width:140px; height:auto; border:1px solid rgba(255,255,255,0.3);"
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 0; font-family: Arial, Helvetica, sans-serif;">
                <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.05em; color:#aaaa9f; text-transform:uppercase;">
                  ${role}
                </p>
                <p style="margin:0 0 16px; font-size:26px; line-height:1.25; color:#ffffff; font-weight:normal;">
                  ¡Hola ${candidateFirstName}! Queremos que te unas a nuestro equipo.
                </p>
                <p style="margin:0 0 24px; font-size:15px; line-height:1.5; color:#ffffff;">
                  Es un placer poder decirte esto: hemos decidido que queremos que formes parte
                  de nuestro equipo como ${role}. Creemos en el talento como nuestro principal
                  activo, y queremos ofrecerte una carrera adaptada a tus objetivos, en un
                  entorno donde la tecnología, la innovación y el know-how van de la mano.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 32px; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#ffffff;">
                      <a
                        href="${offerUrl}"
                        style="display:inline-block; padding:14px 28px; font-size:15px; color:#002532; text-decoration:none;"
                      >
                        Descubre tu oferta
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0; font-size:12px; line-height:1.5; color:#aaaa9f;">
                  Si el botón no funciona, copia este enlace en tu navegador:<br />
                  <a href="${offerUrl}" style="color:#aaaa9f;">${offerUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

async function sendOfferEmail({ candidateEmail, candidateFirstName, role, offerUrl, avatarUrl }) {
  const client = getClient();
  const sender = process.env.AZURE_COMMUNICATION_EMAIL_SENDER;
  if (!sender) {
    const err = new Error('EMAIL_NOT_CONFIGURED');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const poller = await client.beginSend({
    senderAddress: sender,
    content: {
      subject: `Oferta laboral Indra Group: ${role}`,
      html: offerEmailHtml({ candidateFirstName, role, offerUrl, avatarUrl }),
    },
    recipients: { to: [{ address: candidateEmail }] },
  });
  const result = await poller.pollUntilDone();
  return result;
}

module.exports = { sendOfferEmail, offerEmailHtml };
