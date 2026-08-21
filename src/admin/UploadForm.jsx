import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { extractOffer } from './adminApi';

export default function UploadForm({ onExtracted }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFileName(e.target.files?.[0]?.name || null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Selecciona un archivo primero.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await extractOffer(file);
      onExtracted(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 520 }}>
      <Typography sx={{ fontSize: 22, marginBottom: '8px' }}>Nueva oferta</Typography>
      <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: '20px' }}>
        Sube la carta oferta del candidato (.docx o .pdf). Solo se admiten estos dos
        formatos — si el documento está en .doc antiguo, ábrelo en Word y guárdalo como
        .docx antes de subirlo.
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf"
        onChange={handleFileChange}
        style={{ marginBottom: 16 }}
      />
      {fileName && (
        <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', marginBottom: '16px' }}>
          Archivo seleccionado: {fileName}
        </Typography>
      )}

      {error && (
        <Typography sx={{ fontSize: 14, color: '#b00020', marginBottom: '16px' }}>{error}</Typography>
      )}

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Extrayendo…' : 'Cargar y extraer'}
      </Button>
    </Box>
  );
}
