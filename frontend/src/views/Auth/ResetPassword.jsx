import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !tempToken || !newPassword) {
      toast.error('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', { email, tempToken, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please check token.');
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
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
              Enter the reset token code and your new password
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.6)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' }
                  }
                }}
              />

              <TextField
                label="Reset Code Token"
                variant="outlined"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.6)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' }
                  }
                }}
              />

              <TextField
                label="New Password"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.6)' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
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
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
