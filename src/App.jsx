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
import { useRevealOnScroll } from './hooks/useRevealOnScroll';
import { useNarrator } from './hooks/useNarrator';
import { useOfferData } from './data/useOfferData';
import { benefits, reasons, sectors } from './data/staticOfferData';
import { colors } from './theme/theme';

const SCREEN_COUNT = 5;

export default function App({ slug }) {
  const { candidate, screens, stats, loading, error } = useOfferData(slug);
  const { register, revealed, activeIndex, scrollToNext } = useRevealOnScroll(SCREEN_COUNT);
  const [modalOpen, setModalOpen] = useState(false);
  // Owned here (not inside AvatarNarrator) so the active Screen's own body
  // text can be highlighted in sync with the same audio element/state —
  // see NarratedText.jsx.
  const narrator = useNarrator({ activeIndex, modalOpen });

  const progressPct = useMemo(
    () => Math.round((activeIndex / (SCREEN_COUNT - 1)) * 100),
    [activeIndex]
  );
  const sectionLabel = `${activeIndex + 1} de ${SCREEN_COUNT}`;

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

  if (error || !candidate || !screens || !stats) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
        <Typography sx={{ color: colors.blanco, fontSize: 20 }}>
          Esta oferta no existe o ha caducado.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header roleLabel={screens.intro.eyebrow} sectionLabel={sectionLabel} progressPct={progressPct} />

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
            eyebrow={screens.intro.eyebrow}
            greeting={screens.intro.greeting}
            headline={screens.intro.headline}
            headlineVariant="hero"
            body={screens.intro.body}
            narrated={narratedFor(0)}
            tagline={screens.intro.tagline}
          />

          {/* Screen 2 — Offer details */}
          <Screen
            ref={register}
            revealed={revealed.has(1)}
            eyebrow={screens.details.eyebrow}
            headline={screens.details.headline}
            body={screens.details.body}
            narrated={narratedFor(1)}
          >
            <StatGrid stats={stats} />
          </Screen>

          {/* Screen 3 — Benefits */}
          <Screen
            ref={register}
            revealed={revealed.has(2)}
            eyebrow={screens.benefits.eyebrow}
            headline={screens.benefits.headline}
            body={screens.benefits.body}
            narrated={narratedFor(2)}
          >
            <BenefitsGrid benefits={benefits} />
          </Screen>

          {/* Screen 4 — Top Employer */}
          <Screen
            ref={register}
            revealed={revealed.has(3)}
            eyebrow={screens.topEmployer.eyebrow}
            headline={screens.topEmployer.headline}
            body={screens.topEmployer.body}
            narrated={narratedFor(3)}
            badges={screens.topEmployer.badges}
            tagline={screens.topEmployer.tagline}
            taglinePosition="after-children"
          >
            <ReasonsList reasons={reasons} />
          </Screen>

          {/* Screen 5 — Sectors + accept */}
          <Screen
            ref={register}
            revealed={revealed.has(4)}
            eyebrow={screens.sectors.eyebrow}
            headline={screens.sectors.headline}
            body={screens.sectors.body}
            narrated={narratedFor(4)}
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
      />
    </>
  );
}
