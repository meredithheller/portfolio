'use client';

import { Box, Button, Typography, Stack, Fade, Chip } from '@mui/material';
import CarouselArrow from './CarouselArrow';
import CarouselDots from './CarouselDots';
import SectionLabel from './SectionLabel';
import { PROJECTS_DATA } from '../data/projects';

export default function ProjectCard({ index, setIndex }) {
  const proj = PROJECTS_DATA[index];
  const total = PROJECTS_DATA.length;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <SectionLabel label="Projects" current={index} total={total} />
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
        <CarouselArrow
          direction="prev"
          disabled={index === 0}
          onClick={() => setIndex(i => i - 1)}
        />
        <Fade key={`proj-${index}`} in={true} timeout={350}>
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
              {proj.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Source Sans 3", system-ui, sans-serif',
                fontSize: { xs: '1rem', md: '1.15rem' },
                color: 'text.secondary',
                mb: { xs: 3, md: 3.5 },
                lineHeight: 1.8,
                maxWidth: '620px',
              }}
            >
              {proj.description}
            </Typography>
            {proj.tech.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: proj.link ? 3 : 0 }}>
                {proj.tech.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      fontFamily: '"Source Sans 3", system-ui, sans-serif',
                      fontSize: '0.8rem',
                      bgcolor: 'rgba(79, 156, 217, 0.1)',
                      color: 'primary.main',
                      border: '1px solid rgba(79, 156, 217, 0.3)',
                      borderRadius: '20px',
                    }}
                  />
                ))}
              </Stack>
            )}
            {proj.link && (
              <Button
                component="a"
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                sx={{
                  mt: proj.tech.length ? 2 : 0,
                  borderRadius: '50px',
                  px: 2.5,
                  borderWidth: '1.5px',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontFamily: '"Source Sans 3", system-ui, sans-serif',
                  fontSize: '0.85rem',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' },
                }}
              >
                View Project →
              </Button>
            )}
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
