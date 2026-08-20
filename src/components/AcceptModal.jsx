import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { colors } from '../theme/theme';
import avatarSmall from '../assets/images/buddy-avatar-small.png';

export default function AcceptModal({ open, onClose, candidateName = 'Raquel' }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="accept-modal-title"
      PaperProps={{
        sx: {
          background: '#E3E2DA',
          maxWidth: 380,
          width: '100%',
          padding: '30px',
          textAlign: 'center',
          borderRadius: '14px',
        },
      }}
    >
      <Box
        component="img"
        src={avatarSmall}
        alt={`Buddy, el asistente virtual de Indra Group`}
        sx={{ width: 64, height: 84, objectFit: 'cover', margin: '0 auto 14px', borderRadius: '8px' }}
      />
      <Typography
        id="accept-modal-title"
        component="h2"
        sx={{ fontSize: 22, margin: '0 0 10px', color: colors.azulOscuro, fontWeight: 400 }}
      >
        Descarga y firma la aceptación
      </Typography>
      <Typography sx={{ fontSize: '11pt', lineHeight: 1.4, color: '#646459', margin: '0 0 22px' }}>
        Descarga la aceptación, fírmala y responde al email con la aceptación firmada.
        ¡Gracias por unirte a nuestro equipo, {candidateName}!
      </Typography>
      <Button
        onClick={onClose}
        disableRipple
        sx={{
          background: colors.azulOscuro,
          color: colors.blanco,
          borderRadius: '8px',
          padding: '13px 26px',
          fontWeight: 500,
          fontSize: '11pt',
          textTransform: 'none',
          '&:hover': { background: '#004254' },
        }}
      >
        Descargar y firmar aceptación
      </Button>
    </Dialog>
  );
}
