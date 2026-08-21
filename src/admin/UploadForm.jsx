import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { extractOffer } from './adminApi';

const ACCEPTED_EXTENSIONS = ['.docx', '.pdf'];

function isAcceptedFile(file) {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export default function UploadForm({ onExtracted, onBack }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chooseFile = (candidate) => {
    setError(null);
    if (!candidate) return;
    if (!isAcceptedFile(candidate)) {
      setError('Formato no admitido. Solo .docx o .pdf — si el documento está en .doc antiguo, guárdalo como .docx desde Word.');
      setFile(null);
      return;
    }
    setFile(candidate);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    chooseFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 560 }}>
      <Button onClick={onBack} sx={{ marginBottom: '16px', paddingLeft: 0 }}>
        ← Volver
      </Button>

      <Typography sx={{ fontSize: 24, marginBottom: '6px' }}>Nueva oferta</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', marginBottom: '24px' }}>
        Sube la carta oferta del candidato. Se leerán automáticamente sus datos para que
        los revises antes de generar el enlace.
      </Typography>

      <Paper
        variant="outlined"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragActive ? 'primary.main' : 'divider',
          background: dragActive ? 'rgba(0,37,50,0.04)' : 'transparent',
          borderRadius: '10px',
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color .15s ease, background .15s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf"
          hidden
          onChange={(e) => chooseFile(e.target.files?.[0])}
        />

        {file ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontSize: 14 }}>{file.name}</Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <UploadFileOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', marginBottom: '8px' }} />
            <Typography sx={{ fontSize: 14 }}>Arrastra el archivo aquí, o haz clic para elegirlo</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', marginTop: '4px' }}>
              Solo .docx o .pdf
            </Typography>
          </>
        )}
      </Paper>

      {error && (
        <Typography sx={{ fontSize: 13, color: 'error.main', marginTop: '12px' }}>{error}</Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={loading || !file}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        sx={{ marginTop: '20px' }}
      >
        {loading ? 'Extrayendo…' : 'Cargar y extraer'}
      </Button>
    </Box>
  );
}
