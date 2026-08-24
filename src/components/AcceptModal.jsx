import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { colors } from '../theme/theme';
import { cornerStyles } from './OfferButton';
import { confirmationSection } from '../data/narratorConfig';
import avatarSmall from '../assets/images/buddy-avatar-small.png';

export default function AcceptModal({ open, onClose, candidateName = 'Raquel', slug, expiryNotice }) {
  const downloadUrl = slug ? `/api/offers/${encodeURIComponent(slug)}/document` : null;
  const [eyebrowLine] = confirmationSection.eyebrowLines({ name: candidateName });

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
      <Typography sx={{ fontSize: 12, letterSpacing: '0.03em', color: '#8b8b7e', margin: '0 0 6px' }}>
        {eyebrowLine}
      </Typography>
      <Typography
        id="accept-modal-title"
        component="h2"
        sx={{ fontSize: 22, margin: '0 0 10px', color: colors.azulOscuro, fontWeight: 400 }}
      >
        {confirmationSection.title()}
      </Typography>
      <Typography sx={{ fontSize: '11pt', lineHeight: 1.4, color: '#646459', margin: '0 0 14px' }}>
        {confirmationSection.narrationText()}
      </Typography>
      <Typography sx={{ fontSize: '10pt', lineHeight: 1.4, color: '#646459', margin: expiryNotice ? '0 0 6px' : '0 0 22px' }}>
        {confirmationSection.instructionsText()}
      </Typography>
      {expiryNotice && (
        <Typography sx={{ fontSize: '9pt', lineHeight: 1.4, color: '#8b8b7e', margin: '0 0 22px' }}>
          {expiryNotice}
        </Typography>
      )}
      <Button
        component={downloadUrl ? 'a' : 'button'}
        href={downloadUrl || undefined}
        download={downloadUrl ? true : undefined}
        onClick={onClose}
        disableRipple
        sx={{
          position: 'relative',
          background: colors.azulOscuro,
          color: colors.blanco,
          borderRadius: 0,
          padding: '13px 26px',
          fontWeight: 500,
          fontSize: '11pt',
          textTransform: 'none',
          '&:hover': { background: '#004254' },
          ...cornerStyles(10),
        }}
      >
        Descargar y firmar aceptación
      </Button>
      {confirmationSection.closingText().map((line) => (
        <Typography key={line} sx={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#8b8b7e', margin: '14px 0 0' }}>
          {line}
        </Typography>
      ))}
    </Dialog>
  );
}
