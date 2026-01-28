'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Button,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Fade,
  Drawer,
  Container,
  Stack,
  Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f9cd9',
      light: '#7bb4e3',
      dark: '#3a86ff',
    },
    secondary: {
      main: '#2c3e50',
      light: '#5a6c7d',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#5a6c7d',
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    h1: {
      fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontFamily: '"Source Sans 3", system-ui, sans-serif',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Initialize Supabase client
// Replace with your actual Supabase credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Portfolio() {
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState([
    {
      id: 'hero',
      header: "Hi, I'm Meredith,",
      text: "a growth-minded software engineer obsessed with building products users actually come back to. Grounded in empathy and ambition, I turn bold ideas into lasting user value.",
      isDefault: true
    }
  ]);
  
  // UI State
  const [contactAnchor, setContactAnchor] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newHeader, setNewHeader] = useState('');
  const [newText, setNewText] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Secret auth trigger
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);
  const touchStartY = useRef(0);

  // Scroll/swipe: ensure exactly one section per gesture, no glitches
  const scrollContainerRef = useRef(null);
  const wheelAccumulatorRef = useRef(0);
  const lastWheelDirectionRef = useRef(0); // 1 = down, -1 = up
  const isLockedRef = useRef(false);
  const touchHandledRef = useRef(false);
  const stateRef = useRef({ currentSection: 0, sectionCount: 1 });
  const WHEEL_THRESHOLD = 80;
  const SWIPE_THRESHOLD = 60;
  const LOCK_MS = 800;

  useEffect(() => {
    stateRef.current = { currentSection, sectionCount: sections.length };
  }, [currentSection, sections.length]);

  // Load sections from Supabase
  useEffect(() => {
    loadSections();
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
  };

  const loadSections = async () => {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .select('*')
      .order('order_index', { ascending: true });

    if (data && data.length > 0) {
      setSections([
        sections[0],
        ...data.map(section => ({
          id: section.id,
          header: section.header,
          text: section.content,
          isDefault: false
        }))
      ]);
    }
  };

  // Secret auth trigger - triple click logo
  const handleLogoClick = () => {
    // If already authenticated, open edit drawer directly
    if (isAuthenticated) {
      setIsEditOpen(true);
      return;
    }

    // Otherwise, require triple-click for auth
    setClickCount(prev => {
      const newCount = prev + 1;
      
      // Clear existing timer
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      // Reset count after 1 second of no clicks
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);

      // If this is the third click (count was 2, now becomes 3)
      if (prev === 2) {
        setIsAuthOpen(true);
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }
        return 0;
      }
      
      return newCount;
    });
  };

  // Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthError(error.message || 'Authentication failed. Please check your credentials.');
      return;
    }

    if (data.user) {
      setIsAuthenticated(true);
      setIsAuthOpen(false);
      setIsEditOpen(true);
      setEmail('');
      setPassword('');
      setAuthError('');
    }
  };

  // Add new section
  const handleSubmitSection = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!newHeader.trim() || !newText.trim()) {
      setSubmitError('Please fill in both header and text fields.');
      return;
    }
    
    const { data, error } = await supabase
      .from('portfolio_sections')
      .insert([
        {
          header: newHeader.trim(),
          content: newText.trim(),
          order_index: sections.length
        }
      ])
      .select();

    if (error) {
      setSubmitError(error.message || 'Failed to save section. Please try again.');
      return;
    }

    if (data && data.length > 0) {
      setSections([...sections, {
        id: data[0].id,
        header: data[0].header,
        text: data[0].content,
        isDefault: false
      }]);
      setNewHeader('');
      setNewText('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  // Insert hyperlink
  const insertHyperlink = () => {
    const url = prompt('Enter URL (e.g., https://example.com):');
    if (!url) return;
    
    const text = prompt('Enter link text (what users will see):');
    if (!text) return;
    
    // Add protocol if missing
    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + finalUrl;
    }
    
    const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    
    // Insert at cursor position or append
    const textarea = document.querySelector('textarea[value*="' + newText.substring(0, 20) + '"]');
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const textBefore = newText.substring(0, start);
      const textAfter = newText.substring(end);
      setNewText(textBefore + linkHtml + textAfter);
    } else {
      setNewText(prev => prev + (prev ? ' ' : '') + linkHtml);
    }
  };

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsEditOpen(false);
    setNewHeader('');
    setNewText('');
    setSubmitError('');
    setSubmitSuccess(false);
  };

  // Navigate exactly one section and lock until transition completes
  const goSection = useCallback((direction) => {
    if (isLockedRef.current) return false;
    const { currentSection: cur, sectionCount: n } = stateRef.current;
    if (direction > 0 && cur >= n - 1) return false;
    if (direction < 0 && cur <= 0) return false;
    isLockedRef.current = true;
    setIsTransitioning(true);
    setCurrentSection((prev) => prev + direction);
    setTimeout(() => {
      isLockedRef.current = false;
      setIsTransitioning(false);
    }, LOCK_MS);
    return true;
  }, []);

  // Wheel: accumulate delta, one section per logical scroll, preventDefault
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (isLockedRef.current) {
        e.preventDefault();
        return;
      }
      const { currentSection: cur, sectionCount: n } = stateRef.current;
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (dir !== 0 && lastWheelDirectionRef.current !== 0 && dir !== lastWheelDirectionRef.current) {
        wheelAccumulatorRef.current = 0;
      }
      lastWheelDirectionRef.current = dir || lastWheelDirectionRef.current;
      wheelAccumulatorRef.current += e.deltaY;

      const acc = wheelAccumulatorRef.current;
      if (acc >= WHEEL_THRESHOLD && cur < n - 1) {
        wheelAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        goSection(1);
        e.preventDefault();
      } else if (acc <= -WHEEL_THRESHOLD && cur > 0) {
        wheelAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        goSection(-1);
        e.preventDefault();
      } else if (cur >= n - 1 && acc > 0) {
        wheelAccumulatorRef.current = 0;
        e.preventDefault();
      } else if (cur <= 0 && acc < 0) {
        wheelAccumulatorRef.current = 0;
        e.preventDefault();
      } else {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goSection]);

  // Touch: one section per swipe, preventDefault when we handle it
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchHandledRef.current = false;
    };

    const onTouchEnd = (e) => {
      if (isLockedRef.current || touchHandledRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      if (Math.abs(diff) < SWIPE_THRESHOLD) return;

      const { currentSection: cur, sectionCount: n } = stateRef.current;
      if (diff > 0 && cur < n - 1) {
        touchHandledRef.current = true;
        goSection(1);
        e.preventDefault();
      } else if (diff < 0 && cur > 0) {
        touchHandledRef.current = true;
        goSection(-1);
        e.preventDefault();
      }
    };

    const onTouchMove = (e) => {
      if (touchHandledRef.current || isLockedRef.current) {
        e.preventDefault();
        return;
      }
      const y = e.touches[0].clientY;
      const diff = touchStartY.current - y;
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        const { currentSection: cur, sectionCount: n } = stateRef.current;
        const wouldGoNext = diff > 0 && cur < n - 1;
        const wouldGoPrev = diff < 0 && cur > 0;
        if (wouldGoNext || wouldGoPrev) {
          touchHandledRef.current = true;
          goSection(diff > 0 ? 1 : -1);
          e.preventDefault();
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [goSection]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,300..700;1,300..700&display=swap"
        rel="stylesheet"
      />
      
      <Box
        ref={scrollContainerRef}
        sx={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'none',
          backgroundColor: '#fafafa',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: { xs: '1.5rem 2rem', md: '2rem 3rem' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            backgroundColor: 'rgba(250, 250, 250, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography
            variant="h5"
            onClick={handleLogoClick}
            sx={{
              fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
              fontWeight: 600,
              color: 'secondary.main',
              letterSpacing: '0.08em',
              lineHeight: 1.5,
              display: 'block',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            MH
          </Typography>

          <Button
            variant="outlined"
            onClick={(e) => setContactAnchor(e.currentTarget)}
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1,
              borderWidth: '1.5px',
              borderColor: 'primary.main',
              color: 'secondary.main',
              fontWeight: 500,
              letterSpacing: '0.03em',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
                borderRadius: '50%',
                background: 'primary.main',
                transition: 'all 0.4s ease',
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
              },
              '&:hover::before': {
                width: '300px',
                height: '300px',
              },
              '&:hover': {
                color: 'white',
                borderColor: 'primary.main',
              },
            }}
          >
            Contact
          </Button>

          <Menu
            anchorEl={contactAnchor}
            open={Boolean(contactAnchor)}
            onClose={() => setContactAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1,
                minWidth: 200,
              },
            }}
          >
            <MenuItem component="a" href="https://linkedin.com/in/meredith-heller" target="_blank">
              LinkedIn
            </MenuItem>
            <MenuItem component="a" href="https://github.com/meredithheller" target="_blank">
              GitHub
            </MenuItem>
            <MenuItem component="a" href="https://www.instagram.com/meredithaheller" target="_blank">
              Instagram
            </MenuItem>
            <MenuItem component="a" href="https://www.pinterest.com/meredithaheller/pins/" target="_blank">
              Pinterest
            </MenuItem>
            <MenuItem component="a" href="https://shopmy.us/shop/meredithheller?Section_id=1374177&tab=collections" target="_blank">
              ShopMy
            </MenuItem>
          </Menu>
        </Box>

        {/* Sections */}
        <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
          {sections.map((section, index) => (
            <Fade
              key={section.id}
              in={index === currentSection}
              timeout={800}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: { xs: '0 5%', md: '0 10%' },
                  transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.8s ease',
                  transform: index === currentSection 
                    ? 'translateY(0)' 
                    : index < currentSection 
                    ? 'translateY(-100%)' 
                    : 'translateY(100%)',
                  opacity: index === currentSection ? 1 : 0,
                  zIndex: index === currentSection ? 10 : 5,
                  pointerEvents: index === currentSection ? 'auto' : 'none',
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                    fontWeight: 700,
                    letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                    fontSize: { xs: '3rem', sm: '5rem', md: '7rem' },
                    mb: 3,
                    textAlign: 'center',
                    lineHeight: 1.08,
                    color: 'text.primary',
                  }}
                >
                  {section.header}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Source Sans 3", system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: { xs: '1.1rem', md: '1.35rem' },
                    color: 'text.secondary',
                    maxWidth: '700px',
                    textAlign: 'center',
                    lineHeight: 1.8,
                    letterSpacing: '0.01em',
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      borderBottom: '1px solid transparent',
                      transition: 'border-color 0.3s ease',
                      '&:hover': {
                        borderBottomColor: 'primary.main',
                      },
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: section.text }}
                />
              </Box>
            </Fade>
          ))}
        </Box>

        {/* Section Indicators */}
        <Stack
          spacing={2}
          sx={{
            position: 'fixed',
            right: { xs: '1.5rem', md: '3rem' },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
          }}
        >
          {sections.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                if (isTransitioning) return;
                isLockedRef.current = true;
                setIsTransitioning(true);
                setCurrentSection(index);
                setTimeout(() => {
                  isLockedRef.current = false;
                  setIsTransitioning(false);
                }, LOCK_MS);
              }}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: index === currentSection ? 'primary.main' : '#cbd5e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: index === currentSection ? 'scale(1.3)' : 'scale(1)',
                '&:hover': {
                  bgcolor: 'primary.main',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Stack>

        {/* Auth Dialog */}
        <Dialog
          open={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 2 },
          }}
        >
          <form onSubmit={handleAuth}>
            <DialogTitle>
              <Typography variant="h2" sx={{ fontSize: '2rem' }}>
                Admin Access
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {authError && (
                  <Alert severity="error">{authError}</Alert>
                )}
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError('');
                  }}
                  required
                  variant="outlined"
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError('');
                  }}
                  required
                  variant="outlined"
                  autoComplete="current-password"
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setIsAuthOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Sign In
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Drawer */}
        <Drawer
          anchor="bottom"
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          PaperProps={{
            sx: {
              maxHeight: '60vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <Container maxWidth="md" sx={{ py: 4 }}>
            <form onSubmit={handleSubmitSection}>
              <Typography variant="h2" sx={{ fontSize: '1.8rem', mb: 3 }}>
                Add New Section
              </Typography>
              
              <Stack spacing={2}>
                {submitError && (
                  <Alert severity="error">{submitError}</Alert>
                )}
                {submitSuccess && (
                  <Alert severity="success">Section added successfully! It will appear when you scroll.</Alert>
                )}
                <TextField
                  fullWidth
                  label="Section Header"
                  value={newHeader}
                  onChange={(e) => {
                    setNewHeader(e.target.value);
                    setSubmitError('');
                  }}
                  required
                  variant="outlined"
                  placeholder="e.g., My Projects, About Me, Accomplishments"
                />
                <TextField
                  fullWidth
                  label="Section Text"
                  value={newText}
                  onChange={(e) => {
                    setNewText(e.target.value);
                    setSubmitError('');
                  }}
                  required
                  multiline
                  rows={6}
                  variant="outlined"
                  helperText="HTML is supported. Use the 'Insert Link' button to add hyperlinks."
                  placeholder="Write your content here. You can use HTML formatting and links."
                />
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <Button type="submit" variant="contained" size="large">
                    Add Section
                  </Button>
                  <Button variant="outlined" onClick={insertHyperlink} size="large">
                    Insert Link
                  </Button>
                  <Button variant="outlined" onClick={handleLogout} size="large" color="error">
                    Logout
                  </Button>
                  <Button variant="outlined" onClick={() => {
                    setIsEditOpen(false);
                    setNewHeader('');
                    setNewText('');
                    setSubmitError('');
                    setSubmitSuccess(false);
                  }} size="large">
                    Close
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Container>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
