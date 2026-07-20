import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Stack,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined
} from '@mui/icons-material';
import {
  MessageSquare,
  Search,
  BarChart2,
  Lock,
  CheckCircle,
  Database,
  Shield,
  FileText,
  Brain,
  Cpu
} from 'lucide-react';
import { toast } from 'react-toastify';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.92v2.32C2.4 16.02 5.48 18 9 18z" />
    <path fill="#FBBC05" d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.92C.33 6.13 0 7.53 0 9s.33 2.87.92 4.06l3.03-2.32z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.8 11.43 0 9 0 5.48 0 2.4 1.98.92 4.94l3.03 2.32C4.66 5.16 6.65 3.58 9 3.58z" />
  </svg>
);

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google SSO integration is managed via OAuth2. Contact administrator for client credentials.');
  };

  const handleSignUpClick = () => {
    toast.info('User registration is restricted to system admin allocations. Please consult your department manager.');
  };

  // Framer Motion variant configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F8FAFC',
        overflow: 'hidden',
        fontFamily: '"Poppins", sans-serif',
        background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.04) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.04) 0%, rgba(255, 255, 255, 0) 50%), #F8FAFC'
      }}
      className="bg-grid-pattern"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '80%',
          maxWidth: '1240px',
          height: '80vh',
          maxHeight: '740px',
          display: 'flex'
        }}
      >
        <Card
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.04), 0 12px 24px -8px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          
          {/* LEFT SECTION (Branding & Feature Showcases) */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '50%',
              height: '100%',
              p: 4.5,
              background: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
              borderRight: '1px solid #E5E7EB',
              overflow: 'hidden'
            }}
          >
            {/* Top Branding Logo */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  bgcolor: '#4F46E5',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                }}
              >
                <Cpu size={20} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Poppins', color: '#111827', letterSpacing: '-0.5px' }}>
                AeroRAG
              </Typography>
            </Box>

            {/* Central Hero text & Isometric Illustration */}
            <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Box sx={{ width: '100%', maxWidth: 480, mb: 3, textAlign: 'center' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Poppins',
                    color: '#4F46E5',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    fontSize: '0.725rem',
                    mb: 1.25
                  }}
                >
                  AI Powered Intelligent Document Management & Knowledge Retrieval System
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontFamily: 'Poppins',
                    color: '#111827',
                    lineHeight: 1.2,
                    letterSpacing: '-1px',
                    mb: 1.5,
                    fontSize: '1.75rem'
                  }}
                >
                  Intelligent Documents.<br />
                  <span style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Smarter Decisions.
                  </span>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins', lineHeight: 1.6, fontSize: '0.85rem' }}>
                  Upload, search, analyze and chat with your documents using AI-powered Retrieval-Augmented Generation (RAG). Secure, intelligent and enterprise ready.
                </Typography>
              </Box>

              {/* Custom Modern 3D/Isometric SVG document illustration */}
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, height: 210, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  <svg width="180" height="160" viewBox="0 0 200 200" fill="none">
                    {/* Isometric Base Plate */}
                    <path d="M100 30 L170 70 L100 110 L30 70 Z" fill="url(#isometricBase)" opacity="0.8" />
                    <path d="M100 20 L160 55 L100 90 L40 55 Z" fill="url(#isometricPage)" />
                    <rect x="65" y="42" width="70" height="4" rx="2" fill="#E2E8F0" transform="rotate(-15 65 42)" />
                    <rect x="62" y="52" width="50" height="4" rx="2" fill="#E2E8F0" transform="rotate(-15 62 52)" />
                    <rect x="59" y="62" width="60" height="4" rx="2" fill="#E2E8F0" transform="rotate(-15 59 62)" />
                    
                    {/* Floating Document on top */}
                    <g transform="translate(0, -25)">
                      <path d="M100 50 L150 79 L100 108 L50 79 Z" fill="#FFFFFF" filter="url(#shadowFilter)" />
                      <path d="M75 75 L125 104" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                      <path d="M72 84 L110 106" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                      <path d="M69 93 L95 108" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                    </g>
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="isometricBase" x1="30" y1="70" x2="170" y2="70" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4F46E5" stopOpacity="0.1" />
                        <stop offset="1" stopColor="#3B82F6" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="isometricPage" x1="40" y1="55" x2="160" y2="55" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFFFFF" />
                        <stop offset="1" stopColor="#F1F5F9" />
                      </linearGradient>
                      <filter id="shadowFilter" x="30" y="30" width="140" height="110" filterUnits="userSpaceOnUse">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4F46E5" floodOpacity="0.15" />
                      </filter>
                    </defs>
                  </svg>
                </motion.div>

                {/* Floating orbital icons */}
                <motion.div
                  animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  style={{ position: 'absolute', top: '10%', left: '15%', zIndex: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB' }}>
                    <Brain size={12} color="#4F46E5" />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>AI</Typography>
                  </Box>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{ position: 'absolute', top: '25%', right: '10%', zIndex: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB' }}>
                    <FileText size={12} color="#EF4444" />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>PDF</Typography>
                  </Box>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  style={{ position: 'absolute', bottom: '25%', left: '8%', zIndex: 3 }}
                >
                  <Box sx={{ bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
                    <Search size={12} color="#3B82F6" />
                  </Box>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                  style={{ position: 'absolute', bottom: '15%', right: '18%', zIndex: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB' }}>
                    <BarChart2 size={12} color="#10B981" />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Analytics</Typography>
                  </Box>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                  style={{ position: 'absolute', top: '55%', right: '2%', zIndex: 3 }}
                >
                  <Box sx={{ bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
                    <Shield size={12} color="#F59E0B" />
                  </Box>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.7 }}
                  style={{ position: 'absolute', top: '5%', right: '35%', zIndex: 3 }}
                >
                  <Box sx={{ bgcolor: '#FFFFFF', p: 0.75, borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
                    <Database size={12} color="#8B5CF6" />
                  </Box>
                </motion.div>
              </Box>
            </Box>

            {/* Bottom Features (5 Cards) */}
            <Box>
              <Grid container spacing={1}>
                {[
                  { title: 'AI Document Chat', icon: <MessageSquare size={14} color="#4F46E5" /> },
                  { title: 'Smart Search', icon: <Search size={14} color="#3B82F6" /> },
                  { title: 'Analytics Dashboard', icon: <BarChart2 size={14} color="#10B981" /> },
                  { title: 'Secure Repository', icon: <Lock size={14} color="#EF4444" /> },
                  { title: 'Enterprise Ready', icon: <CheckCircle size={14} color="#F59E0B" /> }
                ].map((card, idx) => (
                  <Grid item xs={12} sm={2.4} key={idx}>
                    <motion.div whileHover={{ y: -3 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '1px solid rgba(229, 231, 235, 0.8)',
                          bgcolor: 'rgba(255, 255, 255, 0.45)',
                          backdropFilter: 'blur(10px)',
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                        className="glass-card"
                      >
                        <Box sx={{ mb: 0.75 }}>{card.icon}</Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.625rem',
                            fontFamily: 'Poppins',
                            color: '#111827',
                            lineHeight: 1.1
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

          </Box>

          {/* RIGHT SECTION (Authorization Form Panel) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: { xs: '100%', lg: '50%' },
              height: '100%',
              p: 4.5,
              overflowY: 'auto'
            }}
          >
            {/* Top Right Security Badge */}
            <Box sx={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 0.75, border: '1px solid #E5E7EB', borderRadius: '99px', py: 0.5, px: 1.75, bgcolor: '#FFFFFF' }}>
              <Shield size={12} color="#10B981" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', fontFamily: 'Poppins' }}>
                Enterprise Grade Security
              </Typography>
            </Box>

            {/* Login fields block */}
            <Box sx={{ width: '100%', maxWidth: 380, my: 'auto', py: 2 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* Logo Icon */}
                <motion.div variants={itemVariants}>
                  <Box display="flex" justifyContent="center" mb={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)'
                      }}
                    >
                      <Cpu size={20} />
                    </Box>
                  </Box>
                </motion.div>

                {/* Greeting Headers */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins', color: '#111827', mb: 0.5, letterSpacing: '-0.5px' }}>
                      Welcome Back! 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem' }}>
                      Sign in to continue to AeroRAG
                    </Typography>
                  </Box>
                </motion.div>

                {/* Form fields */}
                <motion.div variants={itemVariants}>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 650, fontFamily: 'Poppins', color: '#374151', mb: 0.75, fontSize: '0.8rem' }}>
                          Username or Email
                        </Typography>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          placeholder="Enter your username or email"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutline fontSize="small" sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': { borderColor: '#E5E7EB' },
                              '&:hover fieldset': { borderColor: '#CBD5E1' },
                              '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: 2 }
                            }
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 650, fontFamily: 'Poppins', color: '#374151', mb: 0.75, fontSize: '0.8rem' }}>
                          Password
                        </Typography>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '& fieldset': { borderColor: '#E5E7EB' },
                              '&:hover fieldset': { borderColor: '#CBD5E1' },
                              '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: 2 }
                            }
                          }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={<Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.775rem', color: '#475569' }}>Remember me</Typography>}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#4F46E5',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontFamily: 'Poppins',
                            fontSize: '0.775rem',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => navigate('/forgot-password')}
                        >
                          Forgot Password?
                        </Typography>
                      </Box>

                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={submitting}
                          sx={{
                            py: 1.25,
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            fontFamily: 'Poppins',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.12)',
                            textTransform: 'none',
                            color: '#FFFFFF',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #3730A3 0%, #2563EB 100%)',
                              boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
                            }
                          }}
                        >
                          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Sign In →'}
                        </Button>
                      </motion.div>
                    </Stack>
                  </form>
                </motion.div>

                {/* OR Divider */}
                <motion.div variants={itemVariants}>
                  <Box display="flex" alignItems="center" my={2.5}>
                    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#E5E7EB' }} />
                    <Typography variant="caption" sx={{ mx: 2, color: '#94A3B8', fontWeight: 600, fontSize: '0.675rem', letterSpacing: '1px' }}>
                      OR
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#E5E7EB' }} />
                  </Box>
                </motion.div>

                {/* Google SSO Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGoogleLogin}
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.1,
                      borderRadius: '12px',
                      borderColor: '#E5E7EB',
                      color: '#374151',
                      fontWeight: 650,
                      fontSize: '0.8rem',
                      fontFamily: 'Poppins',
                      textTransform: 'none',
                      backgroundColor: '#FFFFFF',
                      '&:hover': {
                        borderColor: '#CBD5E1',
                        backgroundColor: '#F8FAFC'
                      }
                    }}
                  >
                    Continue with Google
                  </Button>
                </motion.div>
            </motion.div>
          </Box>

          {/* Bottom account call links */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#475569' }}>
              Don't have an account?{' '}
              <span
                style={{ color: '#4F46E5', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleSignUpClick}
              >
                Sign up
              </span>
            </Typography>
          </Box>

        </Box>

        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
