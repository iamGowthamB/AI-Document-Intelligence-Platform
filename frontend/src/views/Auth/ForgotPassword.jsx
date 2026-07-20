import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { MailOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      const code = res.data.token;
      toast.success('Reset code generated successfully!');
      alert(`DEMO SHORTCUT: Your password reset token code is: ${code}\nThis has also been printed to the Spring Boot console logs.`);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset token.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgb(90, 92, 234) 0%, rgb(30, 32, 100) 90.1%)',
        px: 2
      }}
    >
      <Card
        className="glass-panel"
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#fff'
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Recover Password
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
              Enter your email to receive a temporary recovery token
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email Address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      <MailOutline />
                    </InputAdornment>
                  ),
                  style: { color: '#fff' }
                }}
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.6)' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' }
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)'
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
              </Button>

              <Button
                variant="text"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
