import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import { LockOpen as LockIcon, Person as ProfileIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setUpdating(true);
    try {
      await api.post('/api/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account credentials and security keys
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ProfileIcon color="primary" /> Profile Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                label="Full Name"
                fullWidth
                value={user?.fullName || ''}
                disabled
              />
              <TextField
                label="Username"
                fullWidth
                value={user?.username || ''}
                disabled
              />
              <TextField
                label="Email Address"
                fullWidth
                value={user?.email || ''}
                disabled
              />
              <TextField
                label="Security Role"
                fullWidth
                value={user?.role || ''}
                disabled
              />
              <TextField
                label="Department Allocation"
                fullWidth
                value={user?.departmentName || ''}
                disabled
              />
            </Box>
          </Card>
        </Grid>

        {/* Change Password Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon color="secondary" /> Update Credentials
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handlePasswordChange}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updating}
                  sx={{ py: 1.25, mt: 1 }}
                >
                  {updating ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileSettings;
