import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
export default function AdminApp() {
  const [view, setView] = useState({ name: 'list' });

  return (
    <Box sx={{ background: '#f5f5f0', minHeight: '100vh', padding: '40px 24px', color: '#111' }}>
      <Typography sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', marginBottom: '20px' }}>
        INDRA — GENERADOR DE OFERTAS (uso interno)
      </Typography>

      {view.name === 'list' && (
        <OffersList
          onNew={() => setView({ name: 'upload' })}
          onSelectOffer={(slug) => setView({ name: 'loading-offer', slug })}
        />
      )}

      {view.name === 'upload' && (
        <UploadForm
          onExtracted={({ extraction, sourceDocBlobUrl }) =>
            setView({ name: 'review', extraction, sourceDocBlobUrl })
          }
        />
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
  );
}

function OfferLoader({ slug, onLoaded, onError }) {
  useEffect(() => {
    getOffer(slug).then(onLoaded).catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return <Typography sx={{ fontSize: 14 }}>Cargando oferta…</Typography>;
}
