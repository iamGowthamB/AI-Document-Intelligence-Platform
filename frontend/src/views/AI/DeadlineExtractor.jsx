import React, { useState, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Description as DocIcon,
  CalendarToday as DeadlineIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const DeadlineExtractor = () => {
  const { user } = useContext(AuthContext);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deadlines, setDeadlines] = useState(null);

  // Fetch approved documents in department
  const { data: documents, isLoading } = useQuery({
    queryKey: ['deadlineDocs'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data.filter(doc => doc.status === 'APPROVED');
    }
  });

  // Extract Deadlines Mutation
  const extractMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/api/ai/deadlines/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setDeadlines(data.deadlines);
      toast.success('Deadlines successfully extracted!');
    },
    onError: (err) => {
      toast.error('Failed to extract deadlines: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleExtract = () => {
    if (!selectedDoc) return;
    setDeadlines(null);
    extractMutation.mutate(selectedDoc.id);
  };

  const parseDeadlines = () => {
    if (!deadlines) return [];
    
    // Fallback parsing if LLM output is a raw text block or list of strings
    if (typeof deadlines === 'string') {
      return [{ date: 'Extracted output', event: deadlines, type: 'General' }];
    }
    
    if (Array.isArray(deadlines)) {
      return deadlines.map((item, index) => {
        if (typeof item === 'string') {
          return { date: `Item #${index + 1}`, event: item, type: 'General' };
        }
        return {
          date: item.date || item.expiry || 'N/A',
          event: item.event || item.description || item.context || 'Unknown event',
          type: item.type || 'General'
        };
      });
    }
    
    return [];
  };

  const parsedList = parseDeadlines();

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          AI Deadline & Expiration Extractor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Identify renewal dates, submission milestones, and contract expiries automatically
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Document List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Select Document
            </Typography>
            <Divider />
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '48vh', mt: 1 }}>
              {isLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : documents?.length === 0 ? (
                <Box py={4} textAlign="center">
                  <Typography variant="body2" color="text.secondary">No approved files available.</Typography>
                </Box>
              ) : (
                <List>
                  {documents?.map((doc) => (
                    <ListItem key={doc.id} disablePadding>
                      <ListItemButton
                        selected={selectedDoc?.id === doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        sx={{ borderRadius: 2 }}
                      >
                        <ListItemIcon>
                          <DocIcon color={selectedDoc?.id === doc.id ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={doc.category}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DeadlineIcon />}
              onClick={handleExtract}
              disabled={!selectedDoc || extractMutation.isPending}
              sx={{ py: 1.25, mt: 2 }}
            >
              {extractMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Extract Deadlines'}
            </Button>
          </Card>
        </Grid>

        {/* Right: Timeline view */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" /> Chronicle Deadline Timeline
            </Typography>
            <Divider />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
              {extractMutation.isPending ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">Scanning document pages for legal deadlines...</Typography>
                </Box>
              ) : !deadlines ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <DeadlineIcon sx={{ fontSize: 48, opacity: 0.6, mb: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>No Deadlines Extracted</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Select a document on the left panel and click Extract Deadlines.</Typography>
                </Box>
              ) : parsedList.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">No explicit deadlines identified in this document.</Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative', pl: 4, py: 2 }}>
                  {/* Vertical Timeline bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 11,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      background: 'linear-gradient(180deg, #6366F1 0%, #06B6D4 100%)'
                    }}
                  />
                  {parsedList.map((item, idx) => (
                    <Box key={idx} sx={{ position: 'relative', mb: 4 }}>
                      {/* Timeline Dot */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -27,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: '#6366F1',
                          border: '4px solid #fff',
                          boxShadow: '0 0 0 2px #6366F1'
                        }}
                      />
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                            {item.date}
                          </Typography>
                          <Chip label={item.type.toUpperCase()} size="small" variant="outlined" color="secondary" />
                        </Box>
                        <Typography variant="body2">
                          {item.event}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeadlineExtractor;
