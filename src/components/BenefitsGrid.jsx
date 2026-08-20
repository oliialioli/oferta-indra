import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { colors } from '../theme/theme';

// MUI icons stand in for the bespoke line-art icons in the original Figma
// export. Swap these for real brand icon components when available.
const ICONS = {
  emotional: FavoriteBorderIcon,
  financial: AccountBalanceWalletIcon,
  growth: SchoolIcon,
  physical: HealthAndSafetyIcon,
  impact: VolunteerActivismIcon,
  perks: LocalOfferIcon,
};

function BenefitCard({ item }) {
  const Icon = ICONS[item.icon] || SchoolIcon;
  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.1)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        minHeight: 165,
      }}
    >
      <Icon sx={{ fontSize: 32, color: colors.blanco }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Typography sx={{ fontSize: 18, color: colors.blanco, margin: 0, lineHeight: 1.4 }}>
          {item.title}
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.4, color: colors.grisAcero, margin: 0 }}>
          {item.body}
        </Typography>
      </Box>
    </Box>
  );
}

export default function BenefitsGrid({ benefits }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '4px',
        width: '100%',
      }}
    >
      {benefits.map((item) => (
        <BenefitCard key={item.title} item={item} />
      ))}
    </Box>
  );
}
