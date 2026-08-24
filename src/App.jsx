import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from './components/Header';
import AvatarNarrator from './components/AvatarNarrator';
import Screen from './components/Screen';
import StatGrid from './components/StatGrid';
import BenefitsGrid from './components/BenefitsGrid';
import ReasonsList from './components/ReasonsList';
import SectorsGrid from './components/SectorsGrid';
import StickyCta from './components/StickyCta';
import AcceptModal from './components/AcceptModal';
import OnboardingScreen from './components/OnboardingScreen';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';
import { useNarrator } from './hooks/useNarrator';
import { useOfferData } from './data/useOfferData';
import { benefits, reasons, sectors } from './data/staticOfferData';
import { colors } from './theme/theme';

const SCREEN_COUNT = 5;

export default function App({ slug }) {
  const { candidate, screens, stats, offerExpiresAt, loading, error } = useOfferData(slug);
  const { register, revealed, activeIndex, scrollToNext } = useRevealOnScroll(SCREEN_COUNT);
  const [modalOpen, setModalOpen] = useState(false);
  // Owned here (not inside AvatarNarrator) so the active Screen's own body
  // text can be highlighted in sync with the same audio element/state —
  // see NarratedText.jsx. Created unconditionally (before the onboarding
  // branch below) and shared by both OnboardingScreen and the tour, so the
  // audio choice is one real state transition (narrator.audioDecided)
  // rather than a separate signal that has to be bridged between them.
  const narrator = useNarrator({ activeIndex, modalOpen });

  const progressPct = useMemo(
    () => Math.round((activeIndex / (SCREEN_COUNT - 1)) * 100),
    [activeIndex]
  );
  const sectionLabel = `${activeIndex + 1} de ${SCREEN_COUNT}`;

  const expiryNotice = useMemo(() => {
    if (!offerExpiresAt) return null;
    const formatted = new Date(offerExpiresAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `Esta oferta es válida hasta el ${formatted}.`;
  }, [offerExpiresAt]);

  const narratedFor = (index) => ({
    audioRef: narrator.audioRef,
    active: activeIndex === index && (narrator.audioPhase === 'playing' || narrator.audioPhase === 'paused'),
    ended: activeIndex === index && (narrator.audioPhase === 'ended' || narrator.audioPhase === 'error'),
    revealSeq: narrator.revealSeq,
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: colors.grisAcero }}>Cargando tu oferta…</Typography>
      </Box>
    );
  }

  if (error === 'fetch-error') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <Typography sx={{ color: colors.blanco, fontSize: 20 }}>
          No hemos podido cargar tu oferta. Comprueba tu conexión e inténtalo de nuevo en unos minutos.
        </Typography>
      </Box>
    );
  }

  if (error || !candidate || !screens || !stats) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <Typography sx={{ color: colors.blanco, fontSize: 20 }}>
          Esta oferta no existe o ha caducado.
        </Typography>
      </Box>
    );
  }

  // A genuinely separate page, not a locked first screen inside the tour —
  // none of the tour's markup below (header progress, 5 sections, nav bar)
  // mounts until this is done, so there's nothing to accidentally scroll
  // into and nothing to lock. See OnboardingScreen.jsx. Skipped entirely
  // once narrator.audioDecided is already true — either because the choice
  // was just made (its own buttons call narrator.enableAudio/declineAudio
  // directly) or because it was made earlier this session and useNarrator
  // recovered it from sessionStorage on mount.
  if (!narrator.audioDecided) {
    return <OnboardingScreen candidate={candidate} expiryNotice={expiryNotice} narrator={narrator} />;
  }

  return (
    <>
      <Header roleLabel={candidate.role} sectionLabel={sectionLabel} progressPct={progressPct} />

      <Box sx={{ position: 'relative' }}>
        <AvatarNarrator avatarName={candidate.avatarName} narrator={narrator} />

        <Box
          component="main"
          sx={{
            marginLeft: { xs: 0, md: 'clamp(240px, 47vw, 900px)' },
            maxWidth: 775,
            paddingLeft: { xs: 'clamp(20px, 2.11vw, 40px)', md: 'clamp(8px, 1.2vw, 24px)' },
            paddingRight: 'clamp(20px, 2.11vw, 40px)',
            paddingTop: 0,
            paddingBottom: { xs: '96px', md: 0 },
          }}
        >
          {/* Screen 1 — Intro */}
          <Screen
            ref={register}
            revealed={revealed.has(0)}
            eyebrowLines={screens.intro.eyebrowLines}
            headline={screens.intro.headline}
            headlineVariant="hero"
            body={screens.intro.body}
            narrated={narratedFor(0)}
            wordTimestamps={screens.intro.wordTimestamps}
            secondaryText={screens.intro.secondaryText}
            expiryNotice={expiryNotice}
            closingText={screens.intro.closingText}
          />

          {/* Screen 2 — Offer details */}
          <Screen
            ref={register}
            revealed={revealed.has(1)}
            eyebrowLines={screens.details.eyebrowLines}
            headline={screens.details.headline}
            body={screens.details.body}
            narrated={narratedFor(1)}
            wordTimestamps={screens.details.wordTimestamps}
          >
            <StatGrid stats={stats} />
          </Screen>

          {/* Screen 3 — Benefits */}
          <Screen
            ref={register}
            revealed={revealed.has(2)}
            eyebrowLines={screens.benefits.eyebrowLines}
            headline={screens.benefits.headline}
            body={screens.benefits.body}
            narrated={narratedFor(2)}
            wordTimestamps={screens.benefits.wordTimestamps}
          >
            <BenefitsGrid benefits={benefits} />
          </Screen>

          {/* Screen 4 — Top Employer */}
          <Screen
            ref={register}
            revealed={revealed.has(3)}
            eyebrowLines={screens.topEmployer.eyebrowLines}
            headline={screens.topEmployer.headline}
            body={screens.topEmployer.body}
            narrated={narratedFor(3)}
            wordTimestamps={screens.topEmployer.wordTimestamps}
            badges={screens.topEmployer.badges}
            closingText={screens.topEmployer.closingText}
            closingPosition="after-children"
          >
            <ReasonsList reasons={reasons} />
          </Screen>

          {/* Screen 5 — Sectors + accept */}
          <Screen
            ref={register}
            revealed={revealed.has(4)}
            eyebrowLines={screens.sectors.eyebrowLines}
            headline={screens.sectors.headline}
            body={screens.sectors.body}
            narrated={narratedFor(4)}
            wordTimestamps={screens.sectors.wordTimestamps}
          >
            <SectorsGrid sectors={sectors} />
          </Screen>
        </Box>
      </Box>

      <StickyCta
        onAccept={() => setModalOpen(true)}
        activeIndex={activeIndex}
        screenCount={SCREEN_COUNT}
        onNext={scrollToNext}
      />

      <AcceptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        candidateName={candidate.name}
        slug={slug}
        expiryNotice={expiryNotice}
      />
    </>
  );
}
