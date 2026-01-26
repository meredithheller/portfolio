'use client';

import { useState, useEffect, useRef } from 'react';
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
import { keyframes } from '@mui/system';

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
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#5a6c7d',
    },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 300,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 400,
    },
    body1: {
      fontWeight: 300,
      lineHeight: 1.8,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Animations
const float = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -30px) scale(1.1); }
`;

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
      header: "hi, i'm meredith",
      text: "Hi, I'm Meredith Heller, a growth-minded software engineer obsessed with building products users actually come back to. Grounded in empathy and ambition, I turn bold ideas into lasting user value.",
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

  // Scroll handling
  const handleWheel = (e) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (e.deltaY > 0 && currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else if (e.deltaY < 0 && currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isTransitioning) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      setIsTransitioning(true);
      if (diff > 0 && currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      } else if (diff < 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }
      setTimeout(() => setIsTransitioning(false), 800);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Outfit:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      
      <Box
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(79, 156, 217, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: `${float} 20s ease-in-out infinite`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(58, 134, 255, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: `${float} 15s ease-in-out infinite reverse`,
          },
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
            background: 'linear-gradient(180deg, rgba(248, 249, 250, 0.95) 0%, transparent 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h5"
            onClick={handleLogoClick}
            sx={{
              fontWeight: 300,
              color: 'secondary.main',
              letterSpacing: '0.05em',
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
                    fontSize: { xs: '3rem', sm: '5rem', md: '7rem' },
                    mb: 3,
                    textAlign: 'center',
                    lineHeight: 1.1,
                    color: 'text.primary',
                  }}
                >
                  {section.header}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    color: 'text.secondary',
                    maxWidth: '700px',
                    textAlign: 'center',
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
              onClick={() => !isTransitioning && setCurrentSection(index)}
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
