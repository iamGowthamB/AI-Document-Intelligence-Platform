import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Avatar
} from '@mui/material';
import {
  Users as PeopleIcon,
  Briefcase as DeptIcon,
  FileText as DocIcon,
  HardDrive as StorageIcon,
  Zap as AiIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/system');
      return res.data;
    }
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['recentAuditLogs'],
    queryFn: async () => {
      const res = await api.get('/api/audit-logs');
      return res.data.slice(0, 5);
    }
  });

  if (statsLoading || logsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const trendData = stats?.uploadTrends
    ? Object.keys(stats.uploadTrends).map(key => ({
        date: key,
        count: stats.uploadTrends[key]
      }))
    : [];

  const categoryData = stats?.categories
    ? Object.keys(stats.categories).map(key => ({
        name: key,
        count: stats.categories[key]
      }))
    : [];

  const COLORS = ['#2563EB', '#4F46E5', '#06B6D4', '#10B981', '#7C3AED'];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, letterSpacing: '-1px' }}>
        System Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', width: 48, height: 48, borderRadius: 3 }}>
                <PeopleIcon size={22} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Users</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.totalUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', width: 48, height: 48, borderRadius: 3 }}>
                <DeptIcon size={22} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Departments</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.totalDepartments}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', width: 48, height: 48, borderRadius: 3 }}>
                <DocIcon size={22} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Documents</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.totalDocuments}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', width: 48, height: 48, borderRadius: 3 }}>
                <StorageIcon size={22} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Storage Size</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{formatBytes(stats?.storageUsage)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <Card className="hover-lift">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', width: 48, height: 48, borderRadius: 3 }}>
                <AiIcon size={22} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>AI Inferences</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.aiUsageCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Document Upload Trend</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              {trendData.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No upload history yet.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <YAxis allowDecimals={false} stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2563EB" fillOpacity={0.12} fill="#2563EB" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Categories Distribution</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              {categoryData.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No categorized documents.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <YAxis allowDecimals={false} stroke="#94A3B8" style={{ fontSize: '0.75rem' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Recent System Activity Logs</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No recent activities recorded.
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.user ? log.user.fullName : 'System Seed'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: log.action.startsWith('AI_') ? 'rgba(37, 99, 235, 0.1)' : 'rgba(148, 163, 184, 0.15)',
                          color: log.action.startsWith('AI_') ? '#2563EB' : 'text.primary',
                        }}
                      >
                        {log.action}
                      </Box>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
