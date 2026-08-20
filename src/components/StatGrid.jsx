import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { colors } from '../theme/theme';

function StatItem({ item }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(item.detail);

  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: item.wide ? '1 0 100%' : '1 0 0',
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: 14, color: colors.grisAcero, margin: 0 }}>
        {item.label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography sx={{ fontSize: 18, color: colors.blanco, margin: 0 }}>
          {item.value}
        </Typography>
        {hasDetail && (
          <IconButton
            size="small"
            aria-expanded={open}
            aria-label={open ? 'Ocultar detalle' : 'Mostrar detalle'}
            onClick={() => setOpen((v) => !v)}
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 11,
              padding: 0,
              transition: 'background .2s, color .2s, border-color .2s',
              '&:hover': {
                background: colors.blanco,
                color: colors.azulOscuro,
                borderColor: colors.blanco,
              },
            }}
          >
            i
          </IconButton>
        )}
      </Box>
      {hasDetail && (
        <Collapse in={open} timeout={350}>
          <Typography
            sx={{
              fontSize: 13,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.7)',
              paddingTop: '10px',
              margin: 0,
            }}
          >
            {item.detail}
          </Typography>
        </Collapse>
      )}
    </Box>
  );
}

export default function StatGrid({ stats }) {
  // Chunk into rows of two, matching the original 2-column layout, except
  // "wide" items which take a full row on their own.
  const rows = [];
  let current = [];
  stats.forEach((item) => {
    if (item.wide) {
      if (current.length) rows.push(current);
      rows.push([item]);
      current = [];
    } else {
      current.push(item);
      if (current.length === 2) {
        rows.push(current);
        current = [];
      }
    }
  });
  if (current.length) rows.push(current);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {rows.map((row, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            gap: '4px',
            width: '100%',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {row.map((item) => (
            <StatItem key={item.label} item={item} />
          ))}
        </Box>
      ))}
    </Box>
  );
}
