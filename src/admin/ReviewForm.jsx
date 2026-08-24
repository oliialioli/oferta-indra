import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinkIcon from '@mui/icons-material/Link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { createOffer, updateOffer, sendOfferEmail } from './adminApi';

function extractionToFields(extraction) {
  return {
    candidateFullName: extraction.candidateFullName.value || '',
    candidateFirstName: extraction.candidateFirstName.value || '',
    candidateEmail: '',
    role: '',
    fechaIncorporacion: extraction.fechaIncorporacion.value || '',
    tipoContrato: extraction.tipoContrato.value || '',
    convenioColectivo: extraction.convenioColectivo.value || '',
    categoria: extraction.categoria.value || '',
    centroTrabajo: extraction.centroTrabajo.value || '',
    periodoPruebaMeses: extraction.periodoPruebaMeses.value ?? '',
    retribucionAmount: extraction.retribucionAnualBruta.value?.amount ?? '',
    retribucionPayFrequencyNote: extraction.retribucionAnualBruta.value?.payFrequencyNote ?? '',
    offerValidityDays: 7,
    slug: '',
  };
}

function offerToFields(offer) {
  return {
    candidateFullName: offer.letter.candidateFullName || '',
    candidateFirstName: offer.letter.candidateFirstName || '',
    candidateEmail: offer.letter.candidateEmail || '',
    role: offer.display.role || '',
    fechaIncorporacion: offer.letter.fechaIncorporacion || '',
    tipoContrato: offer.letter.tipoContrato || '',
    convenioColectivo: offer.letter.convenioColectivo || '',
    categoria: offer.letter.categoria || '',
    centroTrabajo: offer.letter.centroTrabajo || '',
    periodoPruebaMeses: offer.letter.periodoPruebaMeses ?? '',
    retribucionAmount: offer.letter.retribucionAnualBruta?.amount ?? '',
    retribucionPayFrequencyNote: offer.letter.retribucionAnualBruta?.payFrequencyNote ?? '',
    offerValidityDays: offer.offerValidityDays ?? 7,
    slug: offer.slug,
  };
}

function fieldsToPayload(fields, sourceDoc) {
  return {
    slug: fields.slug || undefined,
    sourceDocBlobUrl: sourceDoc?.sourceDocBlobUrl || null,
    sourceDocBlobName: sourceDoc?.sourceDocBlobName || null,
    sourceDocFileName: sourceDoc?.sourceDocFileName || null,
    letter: {
      candidateFullName: fields.candidateFullName,
      candidateFirstName: fields.candidateFirstName,
      candidateEmail: fields.candidateEmail,
      fechaIncorporacion: fields.fechaIncorporacion,
      tipoContrato: fields.tipoContrato,
      convenioColectivo: fields.convenioColectivo,
      categoria: fields.categoria,
      centroTrabajo: fields.centroTrabajo,
      periodoPruebaMeses: fields.periodoPruebaMeses === '' ? null : Number(fields.periodoPruebaMeses),
      retribucionAnualBruta: {
        amount: fields.retribucionAmount === '' ? null : Number(fields.retribucionAmount),
        currency: 'EUR',
        payFrequencyNote: fields.retribucionPayFrequencyNote || null,
      },
    },
    display: { role: fields.role },
    offerValidityDays: fields.offerValidityDays === '' ? null : Number(fields.offerValidityDays),
  };
}

const CONFIDENCE_CHIP = {
  missing: { label: 'Falta en el documento', color: 'warning' },
  ambiguous: { label: 'Revisar', color: 'warning' },
};

function FieldRow({ label, value, onChange, confidence, required, type = 'text', helperText }) {
  const chip = confidence && CONFIDENCE_CHIP[confidence];
  return (
    <Box sx={{ marginBottom: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {label}
          {required ? ' *' : ''}
        </Typography>
        {chip && <Chip size="small" label={chip.label} color={chip.color} variant="outlined" />}
      </Box>
      <TextField
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        fullWidth
        size="small"
        helperText={helperText}
      />
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Paper variant="outlined" sx={{ padding: '20px', marginBottom: '20px' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 500, marginBottom: '16px' }}>{title}</Typography>
      {children}
    </Paper>
  );
}

export default function ReviewForm({
  extraction,
  sourceDocBlobUrl,
  sourceDocBlobName,
  sourceDocFileName,
  offer,
  onSaved,
  onBack,
}) {
  const isEditing = Boolean(offer);
  const [fields, setFields] = useState(() => (isEditing ? offerToFields(offer) : extractionToFields(extraction)));
  const [slugState, setSlugState] = useState(offer?.slug || null);
  const [status, setStatus] = useState(offer?.status || 'draft');
  const [publishedUrl, setPublishedUrl] = useState(
    offer?.status === 'published' ? `${window.location.origin}/oferta/${offer.slug}` : null
  );
  const [emailSentAt, setEmailSentAt] = useState(offer?.emailSentAt || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const confidenceFor = (key) => (!isEditing && extraction ? extraction[key]?.confidence : undefined);

  const handleChange = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async (publish) => {
    setSaving(true);
    setError(null);
    try {
      const payload = fieldsToPayload(fields, {
        sourceDocBlobUrl: sourceDocBlobUrl || offer?.sourceDocBlobUrl,
        sourceDocBlobName: sourceDocBlobName || offer?.sourceDocBlobName,
        sourceDocFileName: sourceDocFileName || offer?.sourceDocFileName,
      });
      let result;
      if (slugState) {
        result = await updateOffer(slugState, { ...payload, publish });
      } else {
        result = await createOffer(payload);
        if (publish) result = await updateOffer(result.slug, { publish: true });
      }
      setSlugState(result.slug);
      setStatus(result.status);
      if (result.status === 'published') {
        setPublishedUrl(`${window.location.origin}/oferta/${result.slug}`);
      }
      onSaved?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmSendEmail = async () => {
    setSendingEmail(true);
    setEmailError(null);
    try {
      const result = await sendOfferEmail(slugState);
      setEmailSentAt(result.emailSentAt);
      setConfirmEmailOpen(false);
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Button onClick={onBack} sx={{ marginBottom: '16px', paddingLeft: 0 }}>
        ← Volver
      </Button>

      <Typography sx={{ fontSize: 24, marginBottom: '6px' }}>Revisar datos de la oferta</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', marginBottom: '24px' }}>
        Confirma o corrige cada campo antes de guardar. La extracción automática nunca
        publica directamente — los campos marcados como "falta" o "revisar" necesitan tu
        atención.
      </Typography>

      <Section title="Candidato">
        <FieldRow label="Nombre completo" value={fields.candidateFullName} onChange={handleChange('candidateFullName')} confidence={confidenceFor('candidateFullName')} required />
        <FieldRow label="Nombre de pila (para el saludo)" value={fields.candidateFirstName} onChange={handleChange('candidateFirstName')} confidence={confidenceFor('candidateFirstName')} required />
        <FieldRow
          label="Email del candidato"
          value={fields.candidateEmail}
          onChange={handleChange('candidateEmail')}
          type="email"
          helperText="No aparece en la carta — hace falta introducirlo a mano para poder enviarle el enlace."
        />
        <FieldRow
          label="Puesto a mostrar en la web"
          value={fields.role}
          onChange={handleChange('role')}
          required
          helperText="No es la categoría del convenio — es el título que verá el candidato."
        />
      </Section>

      <Section title="Condiciones laborales">
        <FieldRow label="Categoría (convenio/clasificación laboral)" value={fields.categoria} onChange={handleChange('categoria')} confidence={confidenceFor('categoria')} />
        <FieldRow label="Fecha de incorporación (AAAA-MM-DD)" value={fields.fechaIncorporacion} onChange={handleChange('fechaIncorporacion')} confidence={confidenceFor('fechaIncorporacion')} />
        <FieldRow label="Tipo de contrato" value={fields.tipoContrato} onChange={handleChange('tipoContrato')} confidence={confidenceFor('tipoContrato')} />
        <FieldRow label="Convenio colectivo" value={fields.convenioColectivo} onChange={handleChange('convenioColectivo')} confidence={confidenceFor('convenioColectivo')} />
        <FieldRow label="Centro de trabajo" value={fields.centroTrabajo} onChange={handleChange('centroTrabajo')} confidence={confidenceFor('centroTrabajo')} />
        <FieldRow label="Periodo de prueba (meses)" value={fields.periodoPruebaMeses} onChange={handleChange('periodoPruebaMeses')} confidence={confidenceFor('periodoPruebaMeses')} type="number" />
      </Section>

      <Section title="Retribución">
        <FieldRow label="Retribución anual bruta (€)" value={fields.retribucionAmount} onChange={handleChange('retribucionAmount')} confidence={confidenceFor('retribucionAnualBruta')} type="number" />
        <FieldRow label="Nota de pagas (ej. 'en 14 pagas')" value={fields.retribucionPayFrequencyNote} onChange={handleChange('retribucionPayFrequencyNote')} />
      </Section>

      <Section title="Validez de la oferta">
        <FieldRow
          label="Días de validez desde la publicación"
          value={fields.offerValidityDays}
          onChange={handleChange('offerValidityDays')}
          type="number"
          helperText="El candidato verá un aviso con la fecha límite; pasada esa fecha, el enlace deja de mostrar la oferta. Coincide con la cláusula de validez de la plantilla (7 días)."
        />
      </Section>

      <Section title="Enlace">
        <FieldRow label="Slug de la URL (déjalo en blanco para generarlo)" value={fields.slug} onChange={handleChange('slug')} />
        {publishedUrl && (
          <Alert icon={<LinkIcon fontSize="small" />} severity="success" sx={{ marginTop: '4px', marginBottom: '16px' }}>
            Publicada:{' '}
            <a href={publishedUrl} style={{ color: 'inherit', wordBreak: 'break-all' }}>
              {publishedUrl}
            </a>
          </Alert>
        )}

        {status === 'published' && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<MailOutlineIcon />}
              onClick={() => {
                setEmailError(null);
                setConfirmEmailOpen(true);
              }}
              disabled={!fields.candidateEmail}
            >
              Enviar oferta por email
            </Button>
            {!fields.candidateEmail && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', marginTop: '6px' }}>
                Añade el email del candidato arriba para poder enviarlo.
              </Typography>
            )}
            {emailSentAt && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', marginTop: '6px' }}>
                Último envío: {new Date(emailSentAt).toLocaleString('es-ES')}
              </Typography>
            )}
          </Box>
        )}
      </Section>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: '12px' }}>
        <Button variant="outlined" disabled={saving} onClick={() => save(false)}>
          Guardar borrador
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => save(true)}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {status === 'published' ? 'Actualizar publicación' : 'Publicar'}
        </Button>
      </Box>

      <Dialog open={confirmEmailOpen} onClose={() => !sendingEmail && setConfirmEmailOpen(false)}>
        <DialogTitle>¿Enviar la oferta por email?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, marginBottom: '12px' }}>
            Se enviará un email a <strong>{fields.candidateEmail}</strong> con el enlace a su
            oferta:
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', wordBreak: 'break-all', marginBottom: '12px' }}>
            {publishedUrl}
          </Typography>
          {emailSentAt && (
            <Alert severity="warning" sx={{ marginBottom: '12px' }}>
              Ya se envió antes, el {new Date(emailSentAt).toLocaleString('es-ES')}. Esto enviará
              un nuevo correo.
            </Alert>
          )}
          {emailError && (
            <Alert severity="error" sx={{ marginBottom: '12px' }}>
              {emailError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEmailOpen(false)} disabled={sendingEmail}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmSendEmail}
            disabled={sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Confirmar y enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
