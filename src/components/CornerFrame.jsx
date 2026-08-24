import Box from '@mui/material/Box';

// The four open corner brackets framing the character — an Indra brand
// mark (the same chamfered-corner language as OfferButton's hover state),
// drawn once and mirrored into the other three corners. Shared by
// AvatarNarrator.jsx (the full tour character) and OnboardingBuddy.jsx
// (the compact onboarding character) so both frame Buddy identically.
export default function CornerFrame() {
  const corner = (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      fill="none"
      sx={{ position: 'absolute', width: 36, height: 36, top: 0, left: 0 }}
    >
      <path
        d="M1 22V6L6 1H22"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
    >
      {corner}
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>{corner}</Box>
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scaleY(-1)' }}>{corner}</Box>
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scale(-1, -1)' }}>{corner}</Box>
    </Box>
  );
}
