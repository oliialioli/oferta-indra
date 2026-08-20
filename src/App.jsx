import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Header from './components/Header';
import AvatarNarrator from './components/AvatarNarrator';
import Screen from './components/Screen';
import OfferButton from './components/OfferButton';
import StatGrid from './components/StatGrid';
import BenefitsGrid from './components/BenefitsGrid';
import ReasonsList from './components/ReasonsList';
import SectorsGrid from './components/SectorsGrid';
import StickyCta from './components/StickyCta';
import AcceptModal from './components/AcceptModal';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';
import { candidate, screens, stats, benefits, reasons, sectors } from './data/offerData';

const SCREEN_COUNT = 5;

export default function App() {
  const { register, revealed, activeIndex, scrollToNext } = useRevealOnScroll(SCREEN_COUNT);
  const [modalOpen, setModalOpen] = useState(false);

  const progressPct = useMemo(
    () => Math.round((activeIndex / (SCREEN_COUNT - 1)) * 100),
    [activeIndex]
  );

  return (
    <>
      <Header roleLabel={screens.intro.eyebrow} progressPct={progressPct} />

      <Box sx={{ position: 'relative' }}>
        <AvatarNarrator
          avatarName={candidate.avatarName}
          activeIndex={activeIndex}
          modalOpen={modalOpen}
        />

        <Box
          component="main"
          sx={{
            marginLeft: { xs: 0, md: 'clamp(240px, 47vw, 900px)' },
            maxWidth: 775,
            paddingLeft: { xs: 0, md: 'clamp(8px, 1.2vw, 24px)' },
            paddingRight: 'clamp(20px, 2.11vw, 40px)',
            paddingTop: 0,
          }}
        >
          {/* Screen 1 — Intro */}
          <Screen
            ref={register}
            revealed={revealed.has(0)}
            eyebrow={screens.intro.eyebrow}
            headline={screens.intro.headline}
            body={screens.intro.body}
            tagline={screens.intro.tagline}
          >
            <OfferButton
              onClick={() => scrollToNext(0)}
              endIcon={<ArrowForwardIcon />}
              aria-label={screens.intro.cta}
            >
              {screens.intro.cta}
            </OfferButton>
          </Screen>

          {/* Screen 2 — Offer details */}
          <Screen
            ref={register}
            revealed={revealed.has(1)}
            eyebrow={screens.details.eyebrow}
            headline={screens.details.headline}
            body={screens.details.body}
          >
            <StatGrid stats={stats} />
            <OfferButton
              onClick={() => scrollToNext(1)}
              endIcon={<ArrowForwardIcon />}
              aria-label={screens.details.cta}
            >
              {screens.details.cta}
            </OfferButton>
          </Screen>

          {/* Screen 3 — Benefits */}
          <Screen
            ref={register}
            revealed={revealed.has(2)}
            eyebrow={screens.benefits.eyebrow}
            headline={screens.benefits.headline}
            body={screens.benefits.body}
          >
            <BenefitsGrid benefits={benefits} />
            <OfferButton
              onClick={() => scrollToNext(2)}
              endIcon={<ArrowForwardIcon />}
              aria-label={screens.benefits.cta}
            >
              {screens.benefits.cta}
            </OfferButton>
          </Screen>

          {/* Screen 4 — Top Employer */}
          <Screen
            ref={register}
            revealed={revealed.has(3)}
            eyebrow={screens.topEmployer.eyebrow}
            headline={screens.topEmployer.headline}
            body={screens.topEmployer.body}
            badge={screens.topEmployer.badgeImg}
            badgeAlt={screens.topEmployer.badgeAlt}
            tagline={screens.topEmployer.tagline}
            taglinePosition="after-children"
          >
            <ReasonsList reasons={reasons} />
            <OfferButton
              onClick={() => scrollToNext(3)}
              endIcon={<ArrowForwardIcon />}
              aria-label={screens.topEmployer.cta}
            >
              {screens.topEmployer.cta}
            </OfferButton>
          </Screen>

          {/* Screen 5 — Sectors + accept */}
          <Screen
            ref={register}
            revealed={revealed.has(4)}
            eyebrow={screens.sectors.eyebrow}
            headline={screens.sectors.headline}
            body={screens.sectors.body}
          >
            <SectorsGrid sectors={sectors} />
            <OfferButton
              onClick={() => setModalOpen(true)}
              endIcon={<CheckIcon />}
              aria-label={screens.sectors.cta}
            >
              {screens.sectors.cta}
            </OfferButton>
          </Screen>
        </Box>
      </Box>

      <StickyCta onAccept={() => setModalOpen(true)} />

      <AcceptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        candidateName={candidate.name}
      />
    </>
  );
}
