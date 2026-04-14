'use client';

import { Box, Typography, Stack, Fade } from '@mui/material';
import CarouselArrow from './CarouselArrow';
import CarouselDots from './CarouselDots';
import SectionLabel from './SectionLabel';
import { EXPERIENCE_DATA } from '../data/experience';

export default function ExperienceCard({ index, setIndex }) {
  const exp = EXPERIENCE_DATA[index];
  const total = EXPERIENCE_DATA.length;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <SectionLabel label="Experience" current={index} total={total} />
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
        <CarouselArrow
          direction="prev"
          disabled={index === 0}
          onClick={() => setIndex(i => i - 1)}
        />
        <Fade key={`exp-${index}`} in={true} timeout={350}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.8rem' },
                letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                lineHeight: 1.1,
                color: 'text.primary',
                mb: 1.5,
              }}
            >
              {exp.role}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Source Sans 3", system-ui, sans-serif',
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                color: 'primary.main',
                mb: { xs: 3, md: 4 },
                letterSpacing: '0.01em',
                fontWeight: 500,
              }}
            >
              {exp.company}&nbsp;&nbsp;·&nbsp;&nbsp;{exp.period}&nbsp;&nbsp;·&nbsp;&nbsp;{exp.location}
            </Typography>
            <Stack spacing={2}>
              {exp.bullets.map((bullet, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      lineHeight: 1.75,
                      flexShrink: 0,
                      fontFamily: '"Source Sans 3", system-ui, sans-serif',
                    }}
                  >
                    —
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Source Sans 3", system-ui, sans-serif',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      color: 'text.secondary',
                      lineHeight: 1.75,
                    }}
                  >
                    {bullet}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Typography
              component="a"
              href="https://mail.google.com/mail/?view=cm&to=meredithheller16@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-block',
                mt: { xs: 3, md: 4 },
                fontFamily: '"Source Sans 3", system-ui, sans-serif',
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                color: 'text.secondary',
                textDecoration: 'none',
                borderBottom: '1px solid transparent',
                transition: 'color 0.25s ease, border-color 0.25s ease',
                '&:hover': {
                  color: 'primary.main',
                  borderBottomColor: 'primary.main',
                },
              }}
            >
              Curious to learn more? Email me →
            </Typography>
          </Box>
        </Fade>
        <CarouselArrow
          direction="next"
          disabled={index === total - 1}
          onClick={() => setIndex(i => i + 1)}
        />
      </Box>
      <CarouselDots total={total} current={index} onChange={setIndex} />
    </Box>
  );
}
