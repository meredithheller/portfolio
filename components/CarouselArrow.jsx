'use client';

import { Box } from '@mui/material';

export default function CarouselArrow({ direction, disabled, onClick }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.2 : 0.5,
        transition: 'all 0.25s ease',
        flexShrink: 0,
        fontSize: { xs: '1.6rem', md: '2rem' },
        color: 'text.primary',
        userSelect: 'none',
        lineHeight: 1,
        '&:hover': disabled ? {} : { opacity: 1, color: 'primary.main' },
      }}
    >
      {direction === 'prev' ? '‹' : '›'}
    </Box>
  );
}
