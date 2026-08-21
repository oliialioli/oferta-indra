import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createOffer, updateOffer } from './adminApi';

function extractionToFields(extraction) {
  return {
    candidateFullName: extraction.candidateFullName.value || '',
    candidateFirstName: extraction.candidateFirstName.value || '',
    role: '',
    fechaIncorporacion: extraction.fechaIncorporacion.value || '',
    tipoContrato: extraction.tipoContrato.value || '',
    convenioColectivo: extraction.convenioColectivo.value || '',
    categoria: extraction.categoria.value || '',
    centroTrabajo: extraction.centroTrabajo.value || '',
    periodoPruebaMeses: extraction.periodoPruebaMeses.value ?? '',
    retribucionAmount: extraction.retribucionAnualBruta.value?.amount ?? '',
    retribucionPayFrequencyNote: extraction.retribucionAnualBruta.value?.payFrequencyNote ?? '',
    slug: '',
  };
}

function offerToFields(offer) {
  return {
    candidateFullName: offer.letter.candidateFullName || '',
    candidateFirstName: offer.letter.candidateFirstName || '',
    role: offer.display.role || '',
    fechaIncorporacion: offer.letter.fechaIncorporacion || '',
    tipoContrato: offer.letter.tipoContrato || '',
    convenioColectivo: offer.letter.convenioColectivo || '',
    categoria: offer.letter.categoria || '',
    centroTrabajo: offer.letter.centroTrabajo || '',
    periodoPruebaMeses: offer.letter.periodoPruebaMeses ?? '',
    retribucionAmount: offer.letter.retribucionAnualBruta?.amount ?? '',
    retribucionPayFrequencyNote: offer.letter.retribucionAnualBruta?.payFrequencyNote ?? '',
    slug: offer.slug,
  };
}

function fieldsToPayload(fields, sourceDocBlobUrl) {
  return {
    slug: fields.slug || undefined,
    sourceDocBlobUrl: sourceDocBlobUrl || null,
    letter: {
      candidateFullName: fields.candidateFullName,
      candidateFirstName: fields.candidateFirstName,
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
  };
}

const CONFIDENCE_WARNING = {
  missing: 'No se encontró esta etiqueta en el documento — introdúcelo manualmente.',
  ambiguous: 'Se encontró la etiqueta pero no se pudo interpretar el valor — revísalo.',
};

function FieldRow({ label, value, onChange, warning, required, type = 'text' }) {
  return (
    <Box sx={{ marginBottom: '14px' }}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        fullWidth
        size="small"
        error={Boolean(warning)}
        helperText={warning}
      />
    </Box>
  );
}

export default function ReviewForm({ extraction, sourceDocBlobUrl, offer, onSaved, onBack }) {
  const isEditing = Boolean(offer);
  const [fields, setFields] = useState(() => (isEditing ? offerToFields(offer) : extractionToFields(extraction)));
  const [slugState, setSlugState] = useState(offer?.slug || null);
  const [status, setStatus] = useState(offer?.status || 'draft');
  const [publishedUrl, setPublishedUrl] = useState(
    offer?.status === 'published' ? `${window.location.origin}/oferta/${offer.slug}` : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const warningFor = (key) => (!isEditing && extraction ? CONFIDENCE_WARNING[extraction[key]?.confidence] : undefined);

  const handleChange = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const save = async (publish) => {
    setSaving(true);
    setError(null);
    try {
      const payload = fieldsToPayload(fields, sourceDocBlobUrl || offer?.sourceDocBlobUrl);
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

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Button onClick={onBack} sx={{ marginBottom: '16px' }}>
        ← Volver
      </Button>

      <Typography sx={{ fontSize: 22, marginBottom: '4px' }}>Revisar datos de la oferta</Typography>
      <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: '20px' }}>
        Confirma o corrige cada campo antes de guardar. La extracción automática nunca
        publica directamente.
      </Typography>

      <FieldRow label="Nombre completo del candidato" value={fields.candidateFullName} onChange={handleChange('candidateFullName')} warning={warningFor('candidateFullName')} required />
      <FieldRow label="Nombre de pila (para el saludo)" value={fields.candidateFirstName} onChange={handleChange('candidateFirstName')} warning={warningFor('candidateFirstName')} required />
      <FieldRow
        label="Puesto a mostrar en la web (no es la categoría laboral)"
        value={fields.role}
        onChange={handleChange('role')}
        required
      />
      <FieldRow label="Categoría (convenio/clasificación laboral)" value={fields.categoria} onChange={handleChange('categoria')} warning={warningFor('categoria')} />
      <FieldRow label="Fecha de incorporación (AAAA-MM-DD)" value={fields.fechaIncorporacion} onChange={handleChange('fechaIncorporacion')} warning={warningFor('fechaIncorporacion')} />
      <FieldRow label="Tipo de contrato" value={fields.tipoContrato} onChange={handleChange('tipoContrato')} warning={warningFor('tipoContrato')} />
      <FieldRow label="Convenio colectivo" value={fields.convenioColectivo} onChange={handleChange('convenioColectivo')} warning={warningFor('convenioColectivo')} />
      <FieldRow label="Centro de trabajo" value={fields.centroTrabajo} onChange={handleChange('centroTrabajo')} warning={warningFor('centroTrabajo')} />
      <FieldRow label="Periodo de prueba (meses)" value={fields.periodoPruebaMeses} onChange={handleChange('periodoPruebaMeses')} warning={warningFor('periodoPruebaMeses')} type="number" />
      <FieldRow label="Retribución anual bruta (€)" value={fields.retribucionAmount} onChange={handleChange('retribucionAmount')} warning={warningFor('retribucionAnualBruta')} type="number" />
      <FieldRow label="Nota de pagas (ej. 'en 14 pagas')" value={fields.retribucionPayFrequencyNote} onChange={handleChange('retribucionPayFrequencyNote')} />
      <FieldRow label="Slug de la URL (déjalo en blanco para generarlo)" value={fields.slug} onChange={handleChange('slug')} />

      {error && <Typography sx={{ fontSize: 14, color: '#b00020', marginBottom: '16px' }}>{error}</Typography>}

      {publishedUrl && (
        <Typography sx={{ fontSize: 14, marginBottom: '16px', wordBreak: 'break-all' }}>
          Publicada: <a href={publishedUrl}>{publishedUrl}</a>
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: '12px' }}>
        <Button variant="outlined" disabled={saving} onClick={() => save(false)}>
          Guardar borrador
        </Button>
        <Button variant="contained" disabled={saving} onClick={() => save(true)}>
          {status === 'published' ? 'Actualizar publicación' : 'Publicar'}
        </Button>
      </Box>
    </Box>
  );
}
