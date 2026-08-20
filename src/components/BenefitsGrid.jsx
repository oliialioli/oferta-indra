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
import { useRevealOnce, revealSx } from '../hooks/useRevealOnce';

const ICONS = {
  emotional: EmotionalIcon,
  financial: FinancialIcon,
  growth: GrowthIcon,
  physical: PhysicalIcon,
  impact: ImpactIcon,
  perks: PerksIcon,
};

function BenefitCard({ item, delay }) {
  const Icon = ICONS[item.icon] || GrowthIcon;
  const [ref, revealed] = useRevealOnce();
  return (
    <Box
      ref={ref}
      sx={{
        background: 'rgba(255,255,255,0.1)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        minHeight: 165,
        ...revealSx(revealed, delay),
      }}
    >
      <Box sx={{ width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon style={{ height: '100%', width: '100%', color: colors.blanco, display: 'block' }} />
      </Box>
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
      {benefits.map((item, i) => (
        <BenefitCard key={item.title} item={item} delay={(i % 3) * 80} />
      ))}
    </Box>
  );
}
