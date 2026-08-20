import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { colors } from '../theme/theme';

// Chamfers all four corners of the button itself on hover/focus, echoing the
// original Figma button asset's cut-corner shape. Both states use the same
// 8-point polygon (just with cut = 0 at rest) so clip-path can transition
// smoothly between them instead of jumping.
const chamfer = (cut) =>
  `polygon(${cut}px 0, calc(100% - ${cut}px) 0, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0 calc(100% - ${cut}px), 0 ${cut}px)`;

const cornerStyles = (cut = 14) => ({
  clipPath: chamfer(0),
  transition: 'clip-path .2s cubic-bezier(.2,.8,.2,1)',
  '&:hover, &:focus-visible': { clipPath: chamfer(cut) },
  // The chamfer above is this button's own focus indicator, so the
  // site-wide outline (fonts.css) would otherwise double up on top of it.
  '&:focus-visible': { outline: 'none' },
});

const PrimaryButton = styled(Button)(() => ({
  position: 'relative',
  background: colors.blanco,
  color: colors.azulOscuro,
  padding: '16px 32px',
  fontSize: 18,
  fontWeight: 400,
  textTransform: 'none',
  borderRadius: 0,
  gap: 10,
  '&:hover': { background: colors.blanco },
  ...cornerStyles(),
}));

const GhostButton = styled(Button)(() => ({
  position: 'relative',
  background: 'transparent',
  color: colors.blanco,
  border: '1px solid rgba(255,255,255,0.3)',
  padding: '16px 32px',
  fontSize: 18,
  fontWeight: 400,
  textTransform: 'none',
  borderRadius: 0,
  gap: 10,
  transition: 'background .2s, color .2s',
  '&:hover': { background: colors.blanco, color: colors.azulOscuro },
  ...cornerStyles(),
}));

const StickyButton = styled(Button)(() => ({
  position: 'relative',
  width: '100%',
  background: 'rgba(255,255,255,0.1)',
  color: colors.blanco,
  padding: '24px 10px',
  fontSize: 22,
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: 0,
  gap: 16,
  transition: 'background .2s, color .2s',
  '&:hover': { background: colors.blanco, color: colors.azulOscuro },
  ...cornerStyles(18),
}));

const variantMap = {
  primary: PrimaryButton,
  ghost: GhostButton,
  sticky: StickyButton,
};

/**
 * variant: 'primary' (white, used for "Continue" CTAs) | 'ghost' (outline,
 * used for the audio toggle) | 'sticky' (translucent full-width bottom CTA)
 */
export default function OfferButton({ variant = 'primary', children, icon, endIcon, ...props }) {
  const Component = variantMap[variant] || PrimaryButton;
  return (
    <Component startIcon={icon} endIcon={endIcon} {...props}>
      {children}
    </Component>
  );
}
