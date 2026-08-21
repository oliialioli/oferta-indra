import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme, colors } from '../theme/theme';
import indraLogo from '../assets/images/indra-logo.svg';
import OffersList from './OffersList';
import UploadForm from './UploadForm';
import ReviewForm from './ReviewForm';
import { getOffer } from './adminApi';

// The internal offer-generator tool. Reachable at /interno, gated by Easy
// Auth (Entra ID) at the platform level — see staticwebapp.config.json's
// allowedRoles rule — so anyone who gets past that redirect is already an
// authenticated Indra staff member; this component itself does no login
// handling. Three views, switched locally (no router needed for three
// screens): list -> upload -> review.
//
// Wrapped in its own light-mode ThemeProvider — the main `theme` (default,
// from main.jsx) is dark-mode for the candidate-facing microsite, which
// would render every MUI input's text white-on-white here otherwise.
export default function AdminApp() {
  const [view, setView] = useState({ name: 'list' });

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'background.default' }}>
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 32px',
            background: colors.azulOscuro,
          }}
        >
          <Box component="img" src={indraLogo} alt="Indra Group" sx={{ height: 22, width: 'auto' }} />
          <Typography sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.75)' }}>
            GENERADOR DE OFERTAS · USO INTERNO
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 64px' }}>
          {view.name === 'list' && (
            <OffersList
              onNew={() => setView({ name: 'upload' })}
              onSelectOffer={(slug) => setView({ name: 'loading-offer', slug })}
            />
          )}

          {view.name === 'upload' && (
            <UploadForm
              onBack={() => setView({ name: 'list' })}
              onExtracted={({ extraction, sourceDocBlobUrl }) =>
                setView({ name: 'review', extraction, sourceDocBlobUrl })
              }
            />
          )}

          {view.name === 'loading-offer' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Cargando oferta…</Typography>
            </Box>
          )}
          {view.name === 'loading-offer' && (
            <OfferLoader slug={view.slug} onLoaded={(offer) => setView({ name: 'review', offer })} onError={() => setView({ name: 'list' })} />
          )}

          {view.name === 'review' && (
            <ReviewForm
              extraction={view.extraction}
              sourceDocBlobUrl={view.sourceDocBlobUrl}
              offer={view.offer}
              onBack={() => setView({ name: 'list' })}
              onSaved={() => {}}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function OfferLoader({ slug, onLoaded, onError }) {
  useEffect(() => {
    getOffer(slug).then(onLoaded).catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return null;
}
