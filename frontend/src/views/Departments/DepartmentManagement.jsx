import React, { useState, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
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
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TableSortLabel,
  TablePagination,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as MembersIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const DepartmentManagement = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [deptOpen, setDeptOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Pagination, sorting, and search state parameters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch Departments
  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/departments');
      return res.data;
    }
  });

  // Fetch Members
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['deptMembers', selectedDept?.id],
    queryFn: async () => {
      if (!selectedDept) return [];
      const res = await api.get(`/api/departments/${selectedDept.id}/members`);
      return res.data;
    },
    enabled: false
  });

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: async (deptData) => {
      await api.post('/api/departments', deptData);
    },
    onSuccess: () => {
      toast.success('Department created.');
      setDeptOpen(false);
      clearForm();
      queryClient.invalidateQueries(['departments']);
    },
    onError: (err) => {
      toast.error('Failed to create department: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, deptData }) => {
      await api.put(`/api/departments/${id}`, deptData);
    },
    onSuccess: () => {
      toast.success('Department updated.');
      setDeptOpen(false);
      clearForm();
      queryClient.invalidateQueries(['departments']);
    },
    onError: (err) => {
      toast.error('Failed to update department: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/departments/${id}`);
    },
    onSuccess: () => {
      toast.success('Department deleted.');
      queryClient.invalidateQueries(['departments']);
    },
    onError: (err) => {
      toast.error('Failed to delete department: ' + (err.response?.data?.message || err.message));
    }
  });

  const clearForm = () => {
    setName('');
    setDescription('');
    setSelectedDept(null);
    setEditMode(false);
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setName(dept.name);
    setDescription(dept.description);
    setEditMode(true);
    setDeptOpen(true);
  };

  const handleMembersClick = (dept) => {
    setSelectedDept(dept);
    setTimeout(() => {
      refetchMembers();
      setMembersOpen(true);
    }, 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name, description };
    if (editMode) {
      updateMutation.mutate({ id: selectedDept.id, deptData: payload });
    } else {
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

  // Filter based on admin privileges
  const baseDepartments = useMemo(() => {
    if (!departments) return [];
    return departments.filter(d => isAdmin || d.id === user?.departmentId);
  }, [departments, isAdmin, user]);

  // Sort and Search Filter
  const processedDepartments = useMemo(() => {
    let result = [...baseDepartments];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'name':
          valA = a.name?.toLowerCase() || '';
          valB = b.name?.toLowerCase() || '';
          break;
        case 'description':
          valA = a.description?.toLowerCase() || '';
          valB = b.description?.toLowerCase() || '';
          break;
        case 'members':
          valA = a.memberCount || 0;
          valB = b.memberCount || 0;
          break;
        default:
          valA = a.name?.toLowerCase() || '';
          valB = b.name?.toLowerCase() || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [baseDepartments, searchQuery, sortField, sortDirection]);

  // Paginated Departments
  const paginatedDepartments = useMemo(() => {
    return processedDepartments.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [processedDepartments, page, rowsPerPage]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
            Department Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure system departments and view staff allocations
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { clearForm(); setDeptOpen(true); }}
            sx={{ py: 1, px: 2, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
          >
            Add Department
          </Button>
        )}
      </Box>

      {/* Search and Filters panel */}
      <Card sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by department name or description..."
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
      </Card>

      {/* Departments Table */}
      {deptsLoading ? (
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
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('name')}
                      sx={{ fontWeight: 700 }}
                    >
                      Department Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'description'}
                      direction={sortField === 'description' ? sortDirection : 'asc'}
                      onClick={() => handleSort('description')}
                      sx={{ fontWeight: 700 }}
                    >
                      Description
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'members'}
                      direction={sortField === 'members' ? sortDirection : 'asc'}
                      onClick={() => handleSort('members')}
                      sx={{ fontWeight: 700 }}
                    >
                      Registered Employees
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      No departments found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDepartments.map((dept) => (
                    <TableRow key={dept.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                      <TableCell color="text.secondary">{dept.description || 'No description provided.'}</TableCell>
                      <TableCell>{dept.memberCount} members</TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          <IconButton color="primary" onClick={() => handleMembersClick(dept)}>
                            <MembersIcon />
                          </IconButton>
                          {isAdmin && (
                            <>
                              <IconButton color="secondary" onClick={() => handleEditClick(dept)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => { if(window.confirm('Delete department?')) deleteMutation.mutate(dept.id); }}>
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
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
            count={processedDepartments.length}
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

      {/* Dialog: Add/Edit Department */}
      <Dialog open={deptOpen} onClose={() => setDeptOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editMode ? 'Edit Department' : 'Create Department'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Department Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeptOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!name.trim()}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Department Members */}
      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Members: {selectedDept?.name}</DialogTitle>
        <DialogContent>
          {membersLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : members?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" py={4}>
              No users registered in this department.
            </Typography>
          ) : (
            <List>
              {members?.map((member) => (
                <React.Fragment key={member.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{member.fullName}</Typography>}
                      secondary={`${member.role} • ${member.email}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;
