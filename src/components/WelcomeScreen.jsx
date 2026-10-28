import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import indraLogo from '../assets/images/indra-logo.svg';
import particles from '../assets/images/welcome-particles.png';

const EXIT_MS = 900;
const CYAN = '#22D3EE';
const CERAMICA = '#e3e2da';
const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';

// The two Figma frames ("38" and "39" in "1. Intro") use the very same
// particle image — 39 is just 38 scaled up ~1.46x around the same point, so
// the particles read as a ring (38) or as a dispersed field framing the
// whole viewport (39). `ring` starts as 38 and, when the visitor chooses,
// flies *through* to 39 as the exit transition; `burst` starts already as 39.
const VARIANTS = {
  ring: { base: 1, exit: 1.55 },
  burst: { base: 1.464, exit: 2.1 },
};

const keyframes = {
  '@keyframes welcome-rise': {
    from: { opacity: 0, transform: 'translateY(18px)', filter: 'blur(8px)' },
    to: { opacity: 1, transform: 'none', filter: 'blur(0)' },
  },
  '@keyframes welcome-fade': { from: { opacity: 0 }, to: { opacity: 1 } },
  '@keyframes welcome-particles-in': {
    from: { opacity: 0, transform: 'scale(0.55)', filter: 'blur(14px)' },
    to: { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
  },
  '@keyframes welcome-spin': { to: { transform: 'rotate(360deg)' } },
  '@keyframes welcome-breathe': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.035)' },
  },
  '@keyframes welcome-glow': {
    '0%, 100%': { opacity: 0.55, transform: 'translate(-50%, -50%) scale(1)' },
    '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.12)' },
  },
};

function Words({ text, startDelay, reduced }) {
  return text.split(' ').map((word, i) => (
    <Box
      key={`${word}-${i}`}
      component="span"
      aria-hidden="true"
      sx={{
        display: 'inline-block',
        marginRight: '0.26em',
        animation: reduced ? 'none' : `welcome-rise 0.9s ${EASE_OUT} both`,
        animationDelay: `${startDelay + i * 0.07}s`,
      }}
    >
      {word}
    </Box>
  ));
}

function Rise({ delay, reduced, children, sx }) {
  return (
    <Box sx={{ animation: reduced ? 'none' : `welcome-rise 0.9s ${EASE_OUT} both`, animationDelay: `${delay}s`, ...sx }}>
      {children}
    </Box>
  );
}

/**
 * Welcome page shown before the tour — the Figma "1. Intro" frames. Same job
 * as OnboardingScreen (one real audio choice, nothing from the tour mounted
 * until it's made, shared `narrator`), but centered and particle-driven, and
 * it exits by flying through the particles instead of a plain fade.
 */
export default function WelcomeScreen({ candidate, expiryNotice, narrator, variant = 'ring' }) {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [exiting, setExiting] = useState(false);
  const parallaxRef = useRef(null);
  const { base, exit } = VARIANTS[variant] || VARIANTS.ring;

  // Subtle parallax: the particles drift a few px against the pointer. Written
  // straight to a CSS variable so it never re-renders the page.
  useEffect(() => {
    if (reduced) return undefined;
    const onMove = (e) => {
      const el = parallaxRef.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * -28;
      const y = (e.clientY / window.innerHeight - 0.5) * -28;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const choose = (action) => {
    if (exiting) return;
    if (reduced) {
      action();
      return;
    }
    setExiting(true);
    window.setTimeout(action, EXIT_MS);
  };

  const headline = `${candidate.name}, tu próxima misión puede comenzar aquí.`;

  const actions = (bar) => (
    <>
      <OfferButton
        onClick={() => choose(narrator.enableAudio)}
        icon={<VolumeUpIcon />}
        aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
        sx={{
          minHeight: bar ? 52 : 64,
          fontSize: bar ? 15 : 18,
          fontWeight: 500,
          padding: bar ? '12px' : '16px',
          whiteSpace: 'nowrap',
          flex: bar ? 1 : 'none',
        }}
      >
        Comenzar con audio
      </OfferButton>
      <Button
        onClick={() => choose(narrator.declineAudio)}
        aria-label="Continuar sin narración de audio"
        sx={{
          color: colors.blanco,
          textTransform: 'none',
          fontSize: bar ? 15 : 18,
          fontWeight: 500,
          padding: bar ? '8px 10px' : '8px 16px',
          whiteSpace: 'nowrap',
          minHeight: bar ? 48 : 'auto',
          borderRadius: 0,
          '&:hover': { background: 'transparent', textDecoration: 'underline', textUnderlineOffset: '6px' },
        }}
      >
        Ver sin audio
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        ...keyframes,
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: colors.azulOscuro,
        color: colors.blanco,
        textAlign: 'center',
      }}
    >
      {/* Particles — clipped to the page by their own wrapper, so the page
          itself never needs overflow:hidden. */}
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box
          ref={parallaxRef}
          sx={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            // Desktop: Figma's 1206px at 1440 wide (84vw). Phone: sized so the
            // ring still reads as a ring around the text instead of a few
            // stray dots off-screen.
            '--size': { xs: 'max(125vw, 62vh)', md: 'max(84vw, 112vh)' },
            width: 'var(--size)',
            aspectRatio: '1036 / 932',
            marginLeft: 'calc(var(--size) / -2)',
            marginTop: 'calc(var(--size) * 932 / 1036 / -2)',
            transition: 'transform 0.6s ease-out',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${exiting ? exit : base})`,
              opacity: exiting ? 0 : 1,
              // Opacity only starts dropping late, so most of the fly-through
              // is seen at full brightness.
              transition: reduced
                ? 'none'
                : `transform ${EXIT_MS}ms cubic-bezier(.5,0,.75,.35), opacity ${EXIT_MS * 0.45}ms ease-in ${EXIT_MS * 0.55}ms`,
              WebkitMaskImage: 'radial-gradient(closest-side, #000 84%, transparent 100%)',
              maskImage: 'radial-gradient(closest-side, #000 84%, transparent 100%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                animation: reduced ? 'none' : `welcome-particles-in 2s ${EASE_OUT} both`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  animation: reduced ? 'none' : 'welcome-spin 180s linear infinite',
                }}
              >
                <Box
                  component="img"
                  src={particles}
                  alt=""
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    animation: reduced ? 'none' : 'welcome-breathe 10s ease-in-out infinite',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Soft glow breathing behind the headline. */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: 'min(70vw, 760px)',
            height: 'min(46vh, 420px)',
            borderRadius: '50%',
            background: `radial-gradient(closest-side, rgba(34,211,238,0.10), transparent 100%)`,
            opacity: exiting ? 0 : 1,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.5s ease',
            animation: reduced ? 'none' : 'welcome-glow 7s ease-in-out infinite',
          }}
        />
      </Box>

      {/* Everything that's text/interactive sits above the particles. */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'translateY(-10px)' : 'none',
          filter: exiting ? 'blur(6px)' : 'none',
          transition: reduced ? 'none' : 'opacity 0.45s ease, transform 0.45s ease, filter 0.45s ease',
        }}
      >
        <Box
          component="header"
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: '20px', md: '40px' },
            padding: { xs: '28px 20px 0', md: '32px 24px 0' },
            flexWrap: 'wrap',
          }}
        >
          <Rise delay={0.1} reduced={reduced} sx={{ display: 'flex' }}>
            <Box component="img" src={indraLogo} alt="Indra Group" sx={{ height: 20, width: 'auto', display: 'block' }} />
          </Rise>
          <Rise delay={0.2} reduced={reduced}>
            <Typography sx={{ fontSize: 12, lineHeight: '18px', color: CERAMICA, margin: 0 }}>
              Tu propuesta de {candidate.role}
            </Typography>
          </Rise>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: '100%',
            // 716px of text (the Figma frame's width) plus the side padding.
            maxWidth: { xs: '100%', md: 764 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: '36px', md: '64px' },
            padding: { xs: '32px 20px', md: '0 24px' },
            paddingBottom: { xs: 'calc(96px + env(safe-area-inset-bottom) + 24px)', md: '120px' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Rise delay={0.35} reduced={reduced}>
                <Typography sx={{ fontSize: { xs: 14, md: 17 }, lineHeight: 1.5, color: colors.grisAcero, margin: 0 }}>
                  {candidate.role.toUpperCase()}
                </Typography>
              </Rise>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 'clamp(30px, 8.6vw, 44px)', md: 'clamp(40px, 5vw, 56px)' },
                  lineHeight: { xs: 1.05, md: 1 },
                  fontWeight: 400,
                  margin: 0,
                  textWrap: 'balance',
                }}
              >
                <span className="sr-only">{headline}</span>
                <Words text={headline} startDelay={0.5} reduced={reduced} />
              </Typography>
            </Box>
            <Rise delay={1.25} reduced={reduced}>
              <Typography
                sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.4, maxWidth: 568, margin: 0, textWrap: 'balance' }}
              >
                ¡Hola! Te damos la bienvenida. En este espacio podrás conocer tu propuesta y descubrir todo lo que
                Indra Group pone a tu disposición para crecer, aprender y generar un impacto real.
              </Typography>
            </Rise>
          </Box>

          {isDesktop && (
            <Rise delay={1.55} reduced={reduced} sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {actions(false)}
            </Rise>
          )}

          {!isDesktop && (
            <Rise delay={1.55} reduced={reduced} sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: 360 }}>
                <Typography sx={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Aquí encontrarás toda la información necesaria para tomar tu decisión con confianza.
                </Typography>
              </Box>
              {expiryNotice && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.85 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: colors.grisAcero }} />
                  <Typography sx={{ fontSize: 12, color: colors.grisAcero, margin: 0 }}>{expiryNotice}</Typography>
                </Box>
              )}
            </Rise>
          )}
        </Box>

        {isDesktop && (
          <Rise
            delay={1.9}
            reduced={reduced}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'max(56px, 8vh)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Typography sx={{ fontSize: 17, lineHeight: 1.5, margin: 0 }}>
              Aquí encontrarás toda la información necesaria para tomar tu decisión con confianza.
            </Typography>
            {expiryNotice && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: colors.grisAcero }} />
                <Typography sx={{ fontSize: 13, color: colors.grisAcero, margin: 0 }}>{expiryNotice}</Typography>
              </Box>
            )}
          </Rise>
        )}
      </Box>

      {/* Mobile: same fixed choice bar as the previous onboarding — the
          touch targets stay reachable without scrolling. */}
      {!isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '16px 20px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            background: 'rgba(0,25,34,0.92)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            opacity: exiting ? 0 : 1,
            transition: reduced ? 'none' : 'opacity 0.35s ease',
          }}
        >
          {actions(true)}
        </Box>
      )}
    </Box>
  );
}
