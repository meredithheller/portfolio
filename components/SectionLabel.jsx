'use client';

import { Box, Typography } from '@mui/material';

export default function SectionLabel({ label, current, total }) {
  return (
    <Typography
      sx={{
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontSize: '0.78rem',
        color: 'text.secondary',
        mb: { xs: 4, md: 5 },
        fontFamily: '"Source Sans 3", system-ui, sans-serif',
        fontWeight: 500,
      }}
    >
      {label}&nbsp;&nbsp;&nbsp;
      <Box component="span" sx={{ opacity: 0.5, fontWeight: 400 }}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </Box>
    </Typography>
  );
}
