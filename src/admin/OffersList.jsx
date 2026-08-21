import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { listOffers } from './adminApi';

export default function OffersList({ onSelectOffer, onNew }) {
  const [offers, setOffers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listOffers()
      .then(setOffers)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography sx={{ fontSize: 22 }}>Ofertas generadas</Typography>
        <Button variant="contained" onClick={onNew}>
          Nueva oferta
        </Button>
      </Box>

      {error && <Typography sx={{ fontSize: 14, color: '#b00020' }}>{error}</Typography>}
      {!offers && !error && <Typography sx={{ fontSize: 14 }}>Cargando…</Typography>}
      {offers?.length === 0 && (
        <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          Todavía no se ha generado ninguna oferta.
        </Typography>
      )}

      {offers?.length > 0 && (
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="thead">
            <Box component="tr" sx={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
              <Box component="th" sx={{ padding: '8px', fontSize: 13 }}>Candidato</Box>
              <Box component="th" sx={{ padding: '8px', fontSize: 13 }}>Puesto</Box>
              <Box component="th" sx={{ padding: '8px', fontSize: 13 }}>Estado</Box>
              <Box component="th" sx={{ padding: '8px', fontSize: 13 }}>Creada</Box>
              <Box component="th" sx={{ padding: '8px', fontSize: 13 }} />
            </Box>
          </Box>
          <Box component="tbody">
            {offers.map((offer) => (
              <Box component="tr" key={offer.slug} sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Box component="td" sx={{ padding: '8px', fontSize: 14 }}>{offer.candidateFullName}</Box>
                <Box component="td" sx={{ padding: '8px', fontSize: 14 }}>{offer.role}</Box>
                <Box component="td" sx={{ padding: '8px', fontSize: 14 }}>
                  {offer.status === 'published' ? 'Publicada' : 'Borrador'}
                </Box>
                <Box component="td" sx={{ padding: '8px', fontSize: 14 }}>
                  {new Date(offer.createdAt).toLocaleDateString('es-ES')}
                </Box>
                <Box component="td" sx={{ padding: '8px' }}>
                  <Button size="small" onClick={() => onSelectOffer(offer.slug)}>
                    Editar
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
