'use client';

import { Box, Stack } from '@mui/material';

export default function CarouselDots({ total, current, onChange }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 4, md: 5 } }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          onClick={() => onChange(i)}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: i === current ? 'primary.main' : '#cbd5e0',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            transform: i === current ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </Stack>
  );
}
