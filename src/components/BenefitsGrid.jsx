import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  EmotionalIcon,
  FinancialIcon,
  GrowthIcon,
  PhysicalIcon,
  ImpactIcon,
  PerksIcon,
} from './icons/BenefitIcons';
import { colors } from '../theme/theme';

const ICONS = {
  emotional: EmotionalIcon,
  financial: FinancialIcon,
  growth: GrowthIcon,
  physical: PhysicalIcon,
  impact: ImpactIcon,
  perks: PerksIcon,
};

function BenefitCard({ item }) {
  const Icon = ICONS[item.icon] || GrowthIcon;
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
      <Icon style={{ height: 32, width: 'auto', color: colors.blanco, display: 'block' }} />
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
