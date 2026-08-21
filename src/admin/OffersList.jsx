import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import AddIcon from '@mui/icons-material/Add';
import { listOffers } from './adminApi';

const STATUS_CHIP = {
  published: { label: 'Publicada', color: 'success' },
  draft: { label: 'Borrador', color: 'default' },
};

export default function OffersList({ onSelectOffer, onNew }) {
  const [offers, setOffers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listOffers()
      .then(setOffers)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Typography sx={{ fontSize: 24 }}>Ofertas generadas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}>
          Nueva oferta
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {!offers && !error && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 0' }}>
          <CircularProgress size={18} />
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Cargando…</Typography>
        </Box>
      )}

      {offers?.length === 0 && (
        <Paper variant="outlined" sx={{ padding: '32px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Todavía no se ha generado ninguna oferta.
          </Typography>
        </Paper>
      )}

      {offers?.length > 0 && (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Candidato</TableCell>
                <TableCell>Puesto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creada</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {offers.map((offer) => {
                const chip = STATUS_CHIP[offer.status] || STATUS_CHIP.draft;
                return (
                  <TableRow key={offer.slug} hover>
                    <TableCell>{offer.candidateFullName}</TableCell>
                    <TableCell>{offer.role}</TableCell>
                    <TableCell>
                      <Chip size="small" label={chip.label} color={chip.color} />
                    </TableCell>
                    <TableCell>{new Date(offer.createdAt).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => onSelectOffer(offer.slug)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
