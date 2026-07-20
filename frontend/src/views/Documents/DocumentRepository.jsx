import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Paper,
  InputBase,
  Menu,
  DialogContentText,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  DriveFileRenameOutline as RenameIcon,
  Visibility as PreviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Update as UpdateIcon,
  MoreVert as MoreVertIcon,
  FolderOpen as FolderIcon
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

const DocumentRepository = () => {
  const { user, isAdmin, isManager } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [updateFileOpen, setUpdateFileOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Active document selections
  const [activeDoc, setActiveDoc] = useState(null);
  const [newName, setNewName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Engineering');
  const [uploadTags, setUploadTags] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState('');

  // Dropdown menu state for specific card actions
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDoc, setMenuDoc] = useState(null);

  // Fetch Documents list
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data;
    }
  });

  // Fetch Categories list dynamically from existing documents
  const categories = documents
    ? ['ALL', ...new Set(documents.map((d) => d.category))]
    : ['ALL'];

  // Mutation: Upload
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully.');
      setUploadOpen(false);
      setUploadFile(null);
      setUploadTags('');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err) => {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Update File Version
  const updateFileMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      await api.post(`/api/documents/${id}/update-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Document file updated to a new version.');
      setUpdateFileOpen(false);
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err) => {
      toast.error('Failed to update document version: ' + (err.response?.data?.message || err.message));
    }
  });

  // Mutation: Favorite
  const favoriteMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/api/documents/${id}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['employeeDocs'] });
    }
  });

  // Mutation: Rename
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      await api.patch(`/api/documents/${id}/rename?name=${encodeURIComponent(name)}`);
    },
    onSuccess: () => {
      toast.success('Document renamed successfully.');
      setRenameOpen(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err) => {
      toast.error('Rename failed: ' + err.message);
    }
  });

  // Mutation: Approve
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/api/documents/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Document approved.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // Mutation: Reject
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/api/documents/${id}/reject`);
    },
    onSuccess: () => {
      toast.warning('Document rejected.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/documents/${id}`);
    },
    onSuccess: () => {
      toast.success('Document deleted.');
      setDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err) => {
      toast.error('Failed to delete document: ' + err.message);
    }
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);
    if (uploadTags.trim()) {
      const tags = uploadTags.split(',').map(t => t.trim());
      tags.forEach(t => formData.append('tags', t));
    }
    uploadMutation.mutate(formData);
  };

  const handleUpdateFileSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile || !activeDoc) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    updateFileMutation.mutate({ id: activeDoc.id, formData });
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/api/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download file.');
    }
  };

  const handlePreview = async (doc) => {
    try {
      const response = await api.get(`/api/documents/${doc.id}/preview`, { responseType: 'blob' });
      const mime = response.headers['content-type'] || 'application/octet-stream';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
      setPreviewUrl(url);
      setPreviewMime(mime);
      setActiveDoc(doc);
      setPreviewOpen(true);
    } catch (err) {
      toast.error('Failed to retrieve file preview.');
    }
  };

  // Card Menu triggers
  const handleMenuOpen = (e, doc) => {
    setAnchorEl(e.currentTarget);
    setMenuDoc(doc);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDoc(null);
  };

  // Filter Logic
  const filteredDocuments = React.useMemo(() => {
    return documents
      ? documents.filter((doc) => {
          const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
          const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;
          const matchesFavorites = !favoritesOnly || doc.isFavorite || doc.favorite;
          return matchesSearch && matchesCategory && matchesStatus && matchesFavorites;
        })
      : [];
  }, [documents, searchQuery, selectedCategory, selectedStatus, favoritesOnly]);

  // Sort Logic
  const sortedDocuments = React.useMemo(() => {
    let result = [...filteredDocuments];
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return b.fileSize - a.fileSize;
        case 'size-asc':
          return a.fileSize - b.fileSize;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    return result;
  }, [filteredDocuments, sortBy]);

  // Ensure page index remains within valid bounds when filtered dataset shrinks
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil((sortedDocuments?.length || 0) / itemsPerPage));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [sortedDocuments?.length, page, itemsPerPage]);

  // Paginated Logic
  const paginatedDocs = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDocuments, page]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
            Document Repository
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure enterprise file management and indexing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{ py: 1, px: 2, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
        >
          Upload Document
        </Button>
      </Box>

      {/* Filters Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          borderRadius: 3
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            px: 2,
            py: 0.75,
            borderRadius: 2,
            flexGrow: 1,
            maxWidth: 400
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search by name or tag..."
            fullWidth
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        <TextField
          select
          label="Category"
          size="small"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          size="small"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="ALL">All Status</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </TextField>

        <TextField
          select
          label="Sort By"
          size="small"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="date-desc">Newest First</MenuItem>
          <MenuItem value="date-asc">Oldest First</MenuItem>
          <MenuItem value="name-asc">Name: A-Z</MenuItem>
          <MenuItem value="name-desc">Name: Z-A</MenuItem>
          <MenuItem value="size-desc">Size: Largest First</MenuItem>
          <MenuItem value="size-asc">Size: Smallest First</MenuItem>
        </TextField>

        <FormControlLabel
          control={
            <Switch
              checked={favoritesOnly}
              onChange={(e) => {
                setFavoritesOnly(e.target.checked);
                setPage(1);
              }}
              color="warning"
            />
          }
          label="Favorites Only"
          sx={{ ml: 1, color: 'text.secondary' }}
        />
      </Paper>

      {/* Document Grid */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : sortedDocuments.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            py: 10,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            borderRadius: 3
          }}
        >
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or upload a new file.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedDocs.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Category Chip */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Chip label={doc.category} size="small" color="primary" variant="outlined" />
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, doc)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Document Title */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, wordBreak: 'break-all' }} noWrap>
                      {doc.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                      Size: {formatBytes(doc.fileSize)} • Format: {doc.fileType} • Version: v{doc.version}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Uploaded: {new Date(doc.createdAt).toLocaleDateString()} by {doc.ownerName}
                    </Typography>

                    {/* Status Badge */}
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                      <Chip
                        label={doc.status}
                        size="small"
                        color={
                          doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'error'
                        }
                      />
                    </Box>

                    {/* Tags */}
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {doc.tags.map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" variant="text" />
                      ))}
                    </Box>
                  </CardContent>

                  {/* Card Actions */}
                  <CardActions sx={{ borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => handlePreview(doc)}>
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => handleDownload(doc)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Bookmark">
                        <IconButton size="small" onClick={() => favoriteMutation.mutate(doc.id)}>
                          {(doc.isFavorite || doc.favorite) ? <StarIcon sx={{ color: '#F59E0B' }} /> : <StarBorderIcon sx={{ color: 'text.secondary' }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Managers actions */}
                    {(isAdmin || (isManager && doc.departmentId === user?.departmentId)) && doc.status === 'PENDING' && (
                      <Box display="flex" gap={0.5}>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => approveMutation.mutate(doc.id)}
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => rejectMutation.mutate(doc.id)}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Box>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="center" mt={4} mb={2}>
            <Pagination
              count={Math.ceil(sortedDocuments.length / itemsPerPage)}
              page={page}
              onChange={(e, p) => setPage(p)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Card Popup Dropdown Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); setActiveDoc(menuDoc); setNewName(menuDoc.name); setRenameOpen(true); }}>
          <RenameIcon sx={{ fontSize: 18, mr: 1.5 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setActiveDoc(menuDoc); setUpdateFileOpen(true); }}>
          <UpdateIcon sx={{ fontSize: 18, mr: 1.5 }} /> Update File Version
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { handleMenuClose(); setActiveDoc(menuDoc); setDeleteOpen(true); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Dialog: Upload File */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload New Document</DialogTitle>
        <form onSubmit={handleUploadSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ py: 4, borderStyle: 'dashed', borderWidth: 2 }}
            >
              {uploadFile ? uploadFile.name : 'Select document file'}
              <input
                type="file"
                hidden
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </Button>
            <TextField
              label="Category"
              fullWidth
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            />
            <TextField
              label="Tags (comma separated)"
              placeholder="specifications, guide, q4"
              fullWidth
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!uploadFile || uploadMutation.isPending}>
              Upload & Index
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Update File Version */}
      <Dialog open={updateFileOpen} onClose={() => setUpdateFileOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Version (v{activeDoc?.version})</DialogTitle>
        <form onSubmit={handleUpdateFileSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a new file. This will increase the document version count and re-index the text blocks.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ py: 4, borderStyle: 'dashed', borderWidth: 2 }}
            >
              {uploadFile ? uploadFile.name : 'Select updated file'}
              <input
                type="file"
                hidden
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </Button>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setUpdateFileOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!uploadFile || updateFileMutation.isPending}>
              Upload Version
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog: Rename Document */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Rename Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => renameMutation.mutate({ id: activeDoc.id, name: newName })}
            disabled={!newName.trim() || renameMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Preview file securely */}
      <Dialog open={previewOpen} onClose={() => { setPreviewOpen(false); setPreviewUrl(null); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Preview: {activeDoc?.name}
          <Button size="small" onClick={() => handleDownload(activeDoc)}>Download</Button>
        </DialogTitle>
        <DialogContent sx={{ minHeight: '60vh', p: 0 }}>
          {previewUrl && (
            previewMime.startsWith('image/') ? (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 2, height: '100%' }}>
                <img src={previewUrl} alt="File preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} />
              </Box>
            ) : previewMime === 'text/plain' ? (
              <Box sx={{ p: 3 }}>
                <iframe src={previewUrl} title="Text Preview" style={{ width: '100%', height: '65vh', border: 'none' }} />
              </Box>
            ) : (
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                title="Secure PDF Viewer" 
                style={{ width: '100%', height: '70vh', border: 'none' }} 
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPreviewOpen(false); setPreviewUrl(null); }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Delete confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete document '{activeDoc?.name}'? This will delete all physical files and version histories.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => deleteMutation.mutate(activeDoc.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentRepository;
