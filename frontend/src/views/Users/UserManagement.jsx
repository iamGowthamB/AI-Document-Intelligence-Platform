import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Switch,
  Chip,
  TableSortLabel,
  TablePagination,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const queryClient = useQueryClient();

  const [userOpen, setUserOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');

  // Pagination, sorting, and filtering state parameters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data;
    }
  });

  // Fetch Departments
  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departmentsList'],
    queryFn: async () => {
      const res = await api.get('/api/departments');
      return res.data;
    }
  });

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: async (userData) => {
      await api.post(`/api/users?departmentId=${departmentId}`, userData);
    },
    onSuccess: () => {
      toast.success('User registered successfully.');
      setUserOpen(false);
      clearForm();
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error('Failed to create user: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      await api.put(`/api/users/${id}`, userData);
    },
    onSuccess: () => {
      toast.success('User updated.');
      setUserOpen(false);
      clearForm();
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error('Failed to update user: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      await api.patch(`/api/users/${id}/status?active=${active}`);
    },
    onSuccess: () => {
      toast.success('User account status updated.');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error('Failed to toggle status: ' + err.message);
    }
  });

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
    setRole('EMPLOYEE');
    setDepartmentId('');
    setSelectedUser(null);
    setEditMode(false);
  };

  const handleEditClick = (usr) => {
    setSelectedUser(usr);
    setUsername(usr.username);
    setEmail(usr.email);
    setFullName(usr.fullName);
    setRole(usr.role);
    setDepartmentId(usr.departmentId || '');
    setEditMode(true);
    setUserOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !fullName.trim()) return;

    if (editMode) {
      const payload = {
        email,
        fullName,
        role,
        departmentId,
        active: selectedUser.active
      };
      updateMutation.mutate({ id: selectedUser.id, userData: payload });
    } else {
      const payload = {
        username,
        password,
        email,
        fullName,
        role
      };
      createMutation.mutate(payload);
    }
  };

  // Sort change handler
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
    setPage(0);
  };

  // Process users in memory (filter, sort)
  const processedUsers = useMemo(() => {
    if (!users) return [];

    // 1. Filter
    let filtered = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((u) => {
        const nameMatch = u.fullName?.toLowerCase().includes(q);
        const usernameMatch = u.username?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        const deptMatch = u.departmentName?.toLowerCase().includes(q);
        return nameMatch || usernameMatch || emailMatch || deptMatch;
      });
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (deptFilter !== 'ALL') {
      if (deptFilter === 'NONE') {
        filtered = filtered.filter((u) => !u.departmentName);
      } else {
        filtered = filtered.filter((u) => u.departmentName === deptFilter);
      }
    }

    // 2. Sort
    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'username':
          valA = a.username?.toLowerCase() || '';
          valB = b.username?.toLowerCase() || '';
          break;
        case 'fullName':
          valA = a.fullName?.toLowerCase() || '';
          valB = b.fullName?.toLowerCase() || '';
          break;
        case 'email':
          valA = a.email?.toLowerCase() || '';
          valB = b.email?.toLowerCase() || '';
          break;
        case 'role':
          valA = a.role || '';
          valB = b.role || '';
          break;
        case 'department':
          valA = a.departmentName?.toLowerCase() || '';
          valB = b.departmentName?.toLowerCase() || '';
          break;
        default:
          valA = a.username?.toLowerCase() || '';
          valB = b.username?.toLowerCase() || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, deptFilter, sortField, sortDirection]);

  // Ensure page index remains within valid bounds when filtered users shrink
  React.useEffect(() => {
    const maxPage = Math.max(0, Math.ceil((processedUsers?.length || 0) / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [processedUsers?.length, rowsPerPage, page]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    return processedUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [processedUsers, page, rowsPerPage]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system profiles, allocate departments, and configure security roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { clearForm(); setUserOpen(true); }}
          sx={{ py: 1, px: 2, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
        >
          Add User
        </Button>
      </Box>

      {/* Filter and Search Panel */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, department or username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Department"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              <MenuItem value="NONE">Unallocated</MenuItem>
              {departments?.map((d) => (
                <MenuItem key={d.id} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Users table */}
      {usersLoading || deptsLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'username'}
                      direction={sortField === 'username' ? sortDirection : 'asc'}
                      onClick={() => handleSort('username')}
                      sx={{ fontWeight: 700 }}
                    >
                      Username
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'fullName'}
                      direction={sortField === 'fullName' ? sortDirection : 'asc'}
                      onClick={() => handleSort('fullName')}
                      sx={{ fontWeight: 700 }}
                    >
                      Full Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortDirection : 'asc'}
                      onClick={() => handleSort('email')}
                      sx={{ fontWeight: 700 }}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'role'}
                      direction={sortField === 'role' ? sortDirection : 'asc'}
                      onClick={() => handleSort('role')}
                      sx={{ fontWeight: 700 }}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'department'}
                      direction={sortField === 'department' ? sortDirection : 'asc'}
                      onClick={() => handleSort('department')}
                      sx={{ fontWeight: 700 }}
                    >
                      Department
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      No users found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((usr) => (
                    <TableRow key={usr.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{usr.username}</TableCell>
                      <TableCell>{usr.fullName}</TableCell>
                      <TableCell>{usr.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={usr.role}
                          size="small"
                          color={usr.role === 'ADMIN' ? 'error' : usr.role === 'MANAGER' ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{usr.departmentName || 'None'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={usr.active}
                          onChange={(e) => toggleStatusMutation.mutate({ id: usr.id, active: e.target.checked })}
                          color="success"
                          disabled={usr.username === 'admin'} // prevents deactivating default admin
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="secondary" onClick={() => handleEditClick(usr)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={processedUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      )}

      {/* Dialog: Add/Edit User */}
      <Dialog open={userOpen} onClose={() => setUserOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editMode ? 'Edit User Profile' : 'Register User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={editMode}
            />
            {!editMode && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Full Name"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <TextField
              select
              label="Role"
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="MANAGER">Department Manager</MenuItem>
              <MenuItem value="ADMIN">System Admin</MenuItem>
            </TextField>

            <TextField
              select
              label="Department Allocation"
              fullWidth
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setUserOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
