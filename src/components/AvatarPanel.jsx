import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

export default function AvatarPanel({ avatarName = 'Buddy' }) {
  const videoRef = useRef(null);
  const [audioOn, setAudioOn] = useState(false);
  // Falls back to the static Buddy portrait if no video source is available
  // yet (public/media/buddy-avatar.mp4 missing) or it fails to load.
  const [videoFailed, setVideoFailed] = useState(false);

  // Plays automatically exactly once on mount — never restarted or reloaded
  // as the person scrolls between screens, matching the original behavior.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    video.muted = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        /* autoplay blocked by the browser — fine, poster frame shows */
      });
    }
  }, [videoFailed]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !audioOn;
  }, [audioOn]);

  return (
    <Box
      component="aside"
      aria-label={`${avatarName}, asistente virtual de Indra Group`}
      sx={{
        position: { xs: 'sticky', md: 'fixed' },
        // 42px clears the fixed mobile Header (logo height + padding) so the
        // two bars don't stack on top of each other.
        top: { xs: '42px', md: 0 },
        marginTop: { xs: '42px', md: 0 },
        left: 0,
        width: { xs: '100%', md: 'clamp(240px, 47vw, 900px)' },
        height: { xs: 'auto', md: '100vh' },
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', md: 'center' },
        gap: { xs: '14px', md: 0 },
        padding: { xs: '10px 20px', md: 0 },
        background: { xs: 'rgba(0,37,50,0.6)', md: 'transparent' },
        backdropFilter: { xs: 'blur(10px)', md: 'none' },
        borderBottom: { xs: '1px solid rgba(255,255,255,0.08)', md: 'none' },
        zIndex: 70,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: 52, md: 'clamp(140px, 19.4vw, 368px)' },
          aspectRatio: { xs: '1 / 1', md: '368 / 484' },
          overflow: 'hidden',
        }}
      >
        {videoFailed ? (
          <Box
            component="img"
            src="/images/buddy-avatar-poster.png"
            alt={`${avatarName}, el asistente virtual de Indra Group`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            component="video"
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/buddy-avatar-poster.png"
            onError={() => setVideoFailed(true)}
            aria-label={`${avatarName}, el asistente virtual de Indra Group`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          >
            <source src="/media/buddy-avatar.mp4" type="video/mp4" />
          </Box>
        )}
      </Box>

      <OfferButton
        variant="ghost"
        aria-label={audioOn ? 'Desactivar audio' : 'Activar audio'}
        aria-pressed={audioOn}
        onClick={() => setAudioOn((v) => !v)}
        icon={audioOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
        sx={{
          width: { xs: 'auto', md: 'clamp(140px, 19.4vw, 368px)' },
          marginLeft: { xs: 'auto', md: 0 },
          padding: { xs: '10px 12px', md: '16px 32px' },
          background: audioOn ? colors.blanco : 'transparent',
          color: audioOn ? colors.azulOscuro : colors.blanco,
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {audioOn ? 'Audio activado' : 'Activar audio'}
        </Box>
      </OfferButton>
    </Box>
  );
}
