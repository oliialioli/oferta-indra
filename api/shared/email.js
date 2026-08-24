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

function offerEmailHtml({ candidateFirstName, offerUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #16232a;">
      <p>Hola ${candidateFirstName},</p>
      <p>Tu propuesta de incorporación a Indra Group ya está lista para que la revises.</p>
      <p>
        <a href="${offerUrl}" style="display:inline-block; background:#002532; color:#ffffff; padding:12px 24px; text-decoration:none;">
          Ver mi oferta
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">Si el botón no funciona, copia este enlace en tu navegador:<br />${offerUrl}</p>
    </div>
  `;
}

async function sendOfferEmail({ candidateEmail, candidateFirstName, offerUrl }) {
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
      subject: 'Tu oferta de Indra Group está lista',
      html: offerEmailHtml({ candidateFirstName, offerUrl }),
    },
    recipients: { to: [{ address: candidateEmail }] },
  });
  const result = await poller.pollUntilDone();
  return result;
}

module.exports = { sendOfferEmail };
