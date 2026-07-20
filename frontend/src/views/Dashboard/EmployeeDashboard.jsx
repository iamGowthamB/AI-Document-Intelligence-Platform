import React, { useState, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Description as DocIcon,
  CloudUpload as UploadIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const EmployeeDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Engineering');
  const [tagsInput, setTagsInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ['employeeDocs'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data.filter(doc => doc.ownerId === user.id);
    }
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/documents/favorites');
      return res.data;
    }
  });

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer('');
    try {
      const res = await api.post('/api/ai/chat', { question });
      setAnswer(res.data.answer);
    } catch (err) {
      toast.error('AI chat failed. Check Flask connection.');
    } finally {
      setAsking(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (tagsInput.trim()) {
      const tags = tagsInput.split(',').map(t => t.trim());
      tags.forEach(t => formData.append('tags', t));
    }

    try {
      await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully.');
      setFile(null);
      setTagsInput('');
      queryClient.invalidateQueries({ queryKey: ['employeeDocs'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (docsLoading || favoritesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const recentDocs = docs?.slice(0, 3) || [];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
        Hello, {user?.fullName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage and retrieve your department's knowledge base securely.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Upload */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadIcon color="primary" /> Quick Document Upload
            </Typography>
            <form onSubmit={handleUpload}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ py: 3, borderStyle: 'dashed', borderWidth: 2 }}
                >
                  {file ? file.name : 'Choose file to index'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Button>

                <TextField
                  label="Category"
                  variant="outlined"
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />

                <TextField
                  label="Tags (comma separated)"
                  placeholder="invoice, engineering, 2026"
                  variant="outlined"
                  size="small"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={uploading}
                  sx={{ py: 1 }}
                >
                  {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload & Index'}
                </Button>
              </Box>
            </form>
          </Card>
        </Grid>

        {/* Quick AI Chat */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="secondary" /> Quick AI Retrieval (RAG)
            </Typography>
            <Box component="form" onSubmit={handleAsk} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Ask a question from your documents..."
                variant="outlined"
                size="small"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={asking}>
                {asking ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </Button>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 2,
                maxHeight: 180,
                overflowY: 'auto'
              }}
            >
              {answer ? (
                <Typography variant="body2">{answer}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Ask something to retrieve relevant answers instantly from department records.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Bookmarks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#F59E0B' }} /> Bookmarked Documents
            </Typography>
            {favorites.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No bookmarks added yet.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {favorites.map((fav) => (
                  <Paper
                    key={fav.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {fav.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fav.fileType} • {fav.category}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate('/documents')}
                    >
                      View
                    </Button>
                  </Paper>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Uploads */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocIcon color="primary" /> My Recent Documents
            </Typography>
            {recentDocs.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">You haven't uploaded any documents yet.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentDocs.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{doc.name}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.25,
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: doc.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: doc.status === 'APPROVED' ? '#10B981' : '#F59E0B'
                            }}
                          >
                            {doc.status}
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
