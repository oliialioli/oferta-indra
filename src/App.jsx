import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
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
import { useScrollLock } from './hooks/useScrollLock';
import { buildScreens, benefits, reasons, sectors, devFixtureOffer } from './data/staticOfferData';

const SCREEN_COUNT = 5;

const { candidate, stats } = devFixtureOffer;
const screens = buildScreens(candidate);

export default function App() {
  const { register, revealed, activeIndex, scrollToNext } = useRevealOnScroll(SCREEN_COUNT);
  const [modalOpen, setModalOpen] = useState(false);
  // Owned here (not inside AvatarNarrator) so the active Screen's own body
  // text can be highlighted in sync with the same audio element/state —
  // see NarratedText.jsx.
  const narrator = useNarrator({ activeIndex, modalOpen });
  // Mandatory once per session, not a permanent gate: locks scroll only
  // until the intro screen's audio choice is made (or was already made
  // earlier this session — see useNarrator's sessionStorage read) — needed
  // both so everyone actually sees that choice exists and because playing
  // audio at all requires a real user gesture in most browsers.
  useScrollLock(!narrator.audioDecided);

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
            audioInvite={{ show: !narrator.audioDecided }}
            secondaryText={screens.intro.secondaryText}
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
        audioDecided={narrator.audioDecided}
        onStartAudio={narrator.enableAudio}
        onSkipAudio={narrator.declineAudio}
      />

      <AcceptModal open={modalOpen} onClose={() => setModalOpen(false)} candidateName={candidate.name} />
    </>
  );
}
