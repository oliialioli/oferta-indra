import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OfferButton from './OfferButton';
import OnboardingBuddy from './OnboardingBuddy';
import TypewriterHeadline from './TypewriterHeadline';
import { colors } from '../theme/theme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import indraLogo from '../assets/images/indra-logo.svg';

const EXIT_MS = 220;

/**
 * A genuinely separate, naturally-scrollable page shown before the tour
 * itself — not a locked first screen inside it. Nothing from the tour
 * (its 5 sections, header progress, sticky nav bar) mounts until the
 * audio choice is made, so there's nothing to accidentally reveal and
 * nothing to lock: nobody's scroll is ever going anywhere in this page's
 * own document flow, it just isn't tall enough to fool anyone into
 * thinking there's more below (see the min-height: 100dvh + natural
 * content height below).
 *
 * Shares its `narrator` instance with the tour (App.jsx creates it once,
 * unconditionally) — narrator.enableAudio()/declineAudio() are the exact
 * same functions the tour's own controls call later, so "the choice" is
 * one real state transition, not a separate signal that has to be
 * bridged into the tour afterward.
 */
export default function OnboardingScreen({ candidate, expiryNotice, narrator }) {
  const reducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);

  // A brief fade (skipped entirely under prefers-reduced-motion) before
  // actually committing the choice — narrator.enableAudio/declineAudio
  // flip audioDecided, which is what makes App.jsx swap this screen out
  // for the tour, so delaying that call by the fade's own duration is
  // what makes the fade visible at all instead of being pre-empted by an
  // instant unmount.
  const choose = (action) => {
    if (exiting) return;
    if (reducedMotion) {
      action();
      return;
    }
    setExiting(true);
    window.setTimeout(action, EXIT_MS);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.azulOscuro,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-8px)' : 'none',
        transition: reducedMotion ? 'none' : `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
      }}
    >
      {/* Compact header — no progress here, this isn't part of the 5
          sections yet. */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: { xs: '20px 20px 0', md: '24px clamp(20px, 2.11vw, 40px) 0' },
        }}
      >
        <Box component="img" src={indraLogo} alt="Indra Group" sx={{ height: { xs: 18, md: 28 }, width: 'auto' }} />
        <Typography sx={{ fontSize: 12, color: colors.grisAcero, whiteSpace: 'nowrap' }}>Tu propuesta</Typography>
      </Box>

      {/* Main content — grows with its own content, never clipped; the
          bottom padding clears the fixed choice bar below with room to
          spare so nothing ever hides behind it. */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          padding: { xs: '24px 20px 0', md: '0 clamp(20px, 2.11vw, 40px)' },
          paddingBottom: 'calc(88px + env(safe-area-inset-bottom) + 32px)',
        }}
      >
        {/* Same proportional left column as AvatarNarrator's fixed aside
            (clamp(240px, 47vw, 900px)) so Buddy sits in the same place and
            the text column starts at the same point, on any viewport width —
            not just a small fixed gap that leaves a wide screen half-empty. */}
        <Box
          sx={{
            display: 'flex',
            width: { xs: '100%', md: 'clamp(240px, 47vw, 900px)' },
            justifyContent: 'center',
            marginBottom: { xs: '24px', md: 0 },
          }}
        >
          <OnboardingBuddy narrator={narrator} avatarName={candidate.avatarName} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: '20px', md: '28px' }, maxWidth: 775, paddingLeft: { md: 'clamp(8px, 1.2vw, 24px)' } }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 13, md: 15 }, color: colors.grisAcero, margin: '0 0 6px' }}>
              TU PROPUESTA · {candidate.role.toUpperCase()}
            </Typography>
            <TypewriterHeadline
              text={`${candidate.name}, tu próxima misión puede comenzar aquí.`}
              start
              variant="hero"
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: { xs: '16px 18px', md: '20px 22px' },
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '10px',
            }}
          >
            <Typography sx={{ fontSize: { xs: 17, md: 19 }, color: colors.blanco, fontWeight: 500, margin: 0 }}>
              Conoce tu propuesta con Buddy
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15 }, color: colors.grisAcero, margin: 0, lineHeight: 1.5 }}>
              Un recorrido narrado de unos minutos. Podrás desactivar la narración cuando quieras.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: colors.grisAcero, marginTop: '2px', flex: 'none' }} />
            <Typography sx={{ fontSize: { xs: 14, md: 15 }, color: colors.grisAcero, margin: 0, lineHeight: 1.5 }}>
              Aquí encontrarás toda la información necesaria para tomar tu decisión con confianza.
            </Typography>
          </Box>

          {expiryNotice && (
            <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: colors.grisAcero, opacity: 0.85, margin: 0 }}>
              {expiryNotice}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Fixed choice bar — the only thing this bar ever shows. Normal tour
          navigation (Aceptar oferta / Siguiente) only exists in
          StickyCta.jsx, mounted later once the tour itself does. */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between', md: 'flex-end' },
          gap: { xs: '10px', md: '16px' },
          padding: '16px clamp(20px, 2.11vw, 40px)',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: 'rgba(0,25,34,0.92)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <OfferButton
          variant="ghost"
          onClick={() => choose(narrator.declineAudio)}
          aria-label="Continuar sin narración de audio"
          sx={{ minHeight: 48, padding: { xs: '10px 14px', md: '11px 18px' }, fontSize: { xs: 14, md: 15 } }}
        >
          Ver sin audio
        </OfferButton>
        <OfferButton
          onClick={() => choose(narrator.enableAudio)}
          icon={<VolumeUpIcon />}
          aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
          sx={{
            minHeight: 48,
            flex: { xs: 1, md: 'none' },
            padding: { xs: '10px 14px', md: '11px 18px' },
            fontSize: { xs: 14, md: 15 },
          }}
        >
          Comenzar con Buddy
        </OfferButton>
      </Box>
    </Box>
  );
}
