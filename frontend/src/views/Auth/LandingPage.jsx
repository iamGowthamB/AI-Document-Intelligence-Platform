import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Container,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  FileText,
  Search,
  Cpu,
  Calendar,
  CheckCircle,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Layout as DashboardIcon
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }} className="bg-grid-pattern">
      
      {/* Responsive Navbar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(248, 250, 252, 0.8)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        className="glass-card"
      >
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={24} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-1px' }} className="gradient-text">
                AeroRAG Enterprise
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography
                component="a"
                href="#features"
                variant="body2"
                sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
              >
                Features
              </Typography>
              <Typography
                component="a"
                href="#how-it-works"
                variant="body2"
                sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
              >
                How It Works
              </Typography>
              <Typography
                component="a"
                href="#tech-stack"
                variant="body2"
                sx={{ textDecoration: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
              >
                Tech Stack
              </Typography>
            </Stack>

            <Button
              variant="contained"
              onClick={handleStart}
              sx={{ px: 3, py: 1, background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Chip
                  label="Enterprise Knowledge Management Platform"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 3, fontWeight: 700, borderWidth: 2 }}
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  Unlock the Power of <span className="gradient-text">Enterprise AI</span>
                </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.15rem', mb: 4, lineHeight: 1.7 }}>
                  Seamlessly search, chat with, and analyze text passages, images, and circuit blueprints. AeroRAG indexes your enterprise records dynamically, keeping context secure and accessible.
                </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStart}
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      py: 1.75,
                      px: 4,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                    }}
                  >
                    Go to Console
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component="a"
                    href="#features"
                    sx={{ py: 1.75, px: 4, fontSize: '1rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Explore Features
                  </Button>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 6,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
                className="animate-float"
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontFamily: 'monospace' }}>
                    aerorag_engine.py
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 3 }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      System User
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Analyze electrical connection paths inside schematic_v4.jpg.
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'primary.light', color: 'white', p: 2, borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      AeroRAG AI Agent
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      Parsing schematic topology... Op-Amp circuit detected with negative feedback path resolved via VCC (+5V) and GND terminals.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Feature Cards Section */}
      <Box id="features" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Built for Modern <span className="gradient-text">Operations</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              From PDF parsing to electrical schematic analysis, analyze everything using localized vectors.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, height: '100%' }} className="hover-lift">
                <Box sx={{ color: 'primary.main', mb: 2 }}><FileText size={32} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Chat with Docs</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Directly chat with parsed PDFs and documents in real-time. Lock content context for absolute accuracy.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, height: '100%' }} className="hover-lift">
                <Box sx={{ color: 'secondary.main', mb: 2 }}><Search size={32} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Semantic Explorer</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Retrieve text passages conceptually using vector embeddings. Search policy notices by context.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, height: '100%' }} className="hover-lift">
                <Box sx={{ color: 'info.main', mb: 2 }}><Cpu size={32} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Circuit Blueprint Fallback</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Upload electrical schematics. Automatically identifies components, Op-Amps, VCC, and signals.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, height: '100%' }} className="hover-lift">
                <Box sx={{ color: 'success.main', mb: 2 }}><Calendar size={32} /></Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Deadline Extractor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  OCR-scans contracts and agreements, generating sorted deadline lists and visual timelines.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container id="how-it-works" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            SaaS Document <span className="gradient-text">Processing Flow</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            AeroRAG employs a robust extraction flow designed to securely capture database contents.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Box
                sx={{
                  mx: 'auto',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Layers size={28} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>1. Secure Upload</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Drag and drop your engineering PDF guidelines, blueprints, or text agreements to the repository.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Box
                sx={{
                  mx: 'auto',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'secondary.light',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Database size={28} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>2. Vector Chunking</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Our backend automatically parses text, extracts OCR coordinates, and creates semantic vector mappings.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Box
                sx={{
                  mx: 'auto',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'info.light',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Zap size={28} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>3. Ask & Retrieve</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Ask questions or run semantic searches to extract key dates, metrics, and blueprint components.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Tech Stack Grid */}
      <Box id="tech-stack" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Modern Enterprise <span className="gradient-text">Architecture</span>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A robust, secure stack configured for real-time document processing and analytics.
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center">
            {['React 18', 'Vite', 'Spring Boot', 'Python Flask', 'Chroma DB', 'Gemini Pro 2.5', 'Material UI v5', 'Framer Motion'].map((tech) => (
              <Grid item xs={6} sm={4} md={3} key={tech}>
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }} variant="outlined">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {tech}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call-to-action Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box
          sx={{
            p: { xs: 6, md: 8 },
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            color: 'white',
            borderRadius: 6,
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(37,99,235,0.25)',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>
            Elevate Your Enterprise Knowledge Base
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4, opacity: 0.9 }}>
            Join medium and large organizations leveraging AeroRAG to index their guidelines, blueprint files, and policies.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStart}
            sx={{
              py: 1.75,
              px: 5,
              fontSize: '1.05rem',
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} mb={6}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Cpu size={24} color="#2563EB" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AeroRAG
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  AeroRAG is a secure, state-of-the-art enterprise Retrieval-Augmented Generation application for files, text passages, and blueprint schematics.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Platform</Typography>
              <Stack spacing={1}>
                <Typography component="a" href="#features" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none' }}>Features</Typography>
                <Typography component="a" href="#how-it-works" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none' }}>How it Works</Typography>
                <Typography component="a" href="#tech-stack" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none' }}>Tech Stack</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Security</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <Shield size={14} /> Audit Logging
                </Typography>
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <CheckCircle size={14} /> Role Restrictions
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} AeroRAG Systems Inc. All rights reserved. Built with React & MUI.
          </Typography>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
