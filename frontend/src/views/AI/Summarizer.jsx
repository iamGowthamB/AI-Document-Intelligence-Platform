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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Description as DocIcon,
  AutoAwesome as SummarizeIcon,
  FormatListBulleted as HighlightsIcon,
  MenuBook as OverviewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Summarizer = () => {
  const { user } = useContext(AuthContext);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [summary, setSummary] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Fetch approved documents in the department
  const { data: documents, isLoading } = useQuery({
    queryKey: ['summarizerDocs'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      return res.data.filter(doc => doc.status === 'APPROVED');
    }
  });

  // Summarize Mutation
  const summarizeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/api/ai/summarize/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      toast.success('Document summary generated successfully.');
    },
    onError: (err) => {
      toast.error('Summarization failed: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSummarize = () => {
    if (!selectedDoc) return;
    setSummary('');
    summarizeMutation.mutate(selectedDoc.id);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Helper to split summaries into tabbed content
  const getSectionContent = () => {
    if (!summary) return '';

    // Standard split assumptions if prompt returns structured headings
    if (tabValue === 1) {
      // Highlights section
      const lines = summary.split('\n');
      const highlights = lines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.match(/^\d+\./));
      return highlights.length > 0 ? highlights.join('\n') : 'No structured highlights found. Standard summary:\n\n' + summary;
    }
    
    return summary;
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          AI Document Summarizer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate executive summaries and structured highlights instantly
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Document Selection List */}
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
              startIcon={<SummarizeIcon />}
              onClick={handleSummarize}
              disabled={!selectedDoc || summarizeMutation.isPending}
              sx={{ py: 1.25, mt: 2 }}
            >
              {summarizeMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Summarize File'}
            </Button>
          </Card>
        </Grid>

        {/* Summary Content Panel */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab icon={<OverviewIcon sx={{ fontSize: 18 }} />} label="Executive Summary" iconPosition="start" />
                <Tab icon={<HighlightsIcon sx={{ fontSize: 18 }} />} label="Key Highlights" iconPosition="start" />
              </Tabs>
            </Box>

            {/* Display summary */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
              {summarizeMutation.isPending ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">Parsing file structure and condensing content...</Typography>
                </Box>
              ) : !summary ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <SummarizeIcon sx={{ fontSize: 48, opacity: 0.6, mb: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>No Summary Generated</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Select a document on the left panel and click Summarize File.</Typography>
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3, minHeight: '85%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{selectedDoc?.name}</Typography>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {getSectionContent()}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summarizer;
