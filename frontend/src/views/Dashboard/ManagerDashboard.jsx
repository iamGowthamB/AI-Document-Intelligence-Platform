import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DocIcon,
  Storage as StorageIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ManagerDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['departmentAnalytics'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/department');
      return res.data;
    }
  });

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ['departmentDocuments'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data;
    }
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['departmentMembers'],
    queryFn: async () => {
      const userRes = await api.get('/api/auth/profile');
      const deptId = userRes.data.departmentId;
      if (!deptId) return [];
      const res = await api.get(`/api/departments/${deptId}/members`);
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/api/documents/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Document approved successfully.');
      queryClient.invalidateQueries({ queryKey: ['departmentDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['departmentAnalytics'] });
    },
    onError: (err) => {
      toast.error('Failed to approve document: ' + err.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/api/documents/${id}/reject`);
    },
    onSuccess: () => {
      toast.success('Document rejected.');
      queryClient.invalidateQueries({ queryKey: ['departmentDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['departmentAnalytics'] });
    },
    onError: (err) => {
      toast.error('Failed to reject document: ' + err.message);
    }
  });

  if (statsLoading || docsLoading || membersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const pendingDocs = docs?.filter(doc => doc.status === 'PENDING') || [];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, letterSpacing: '-1px' }}>
        Department Dashboard
      </Typography>

      {/* KPI Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', width: 48, height: 48 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Team Members</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats?.totalUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', width: 48, height: 48 }}>
                <DocIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Files</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats?.totalDocuments}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', width: 48, height: 48 }}>
                <StorageIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Department Storage</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatBytes(stats?.storageUsage)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover-lift" sx={{ border: stats?.pendingApprovals > 0 ? '1px solid #EF4444' : 'inherit' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: stats?.pendingApprovals > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: stats?.pendingApprovals > 0 ? '#EF4444' : '#6B7280', width: 48, height: 48 }}>
                <PendingIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Pending Approvals</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: stats?.pendingApprovals > 0 ? '#EF4444' : 'inherit' }}>{stats?.pendingApprovals}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Approvals Panel */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Pending Approvals Queue
            </Typography>
            {pendingDocs.length === 0 ? (
              <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography color="text.secondary">All clear! No documents pending approval.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Document Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Uploaded By</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingDocs.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{doc.name}</TableCell>
                        <TableCell>{doc.ownerName}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell align="right">
                          <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => approveMutation.mutate(doc.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<RejectIcon />}
                              onClick={() => rejectMutation.mutate(doc.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Team Members List */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Team Members
            </Typography>
            <Divider />
            <List>
              {members.map((member) => (
                <ListItem key={member.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{member.fullName}</Typography>}
                    secondary={member.role + " • " + member.email}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: member.active ? '#10B981' : '#EF4444'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
