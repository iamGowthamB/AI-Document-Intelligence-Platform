import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Divider,
  Chip,
  Pagination
} from '@mui/material';
import {
  TravelExplore as SearchIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ExpandablePassage = ({ text, formatPassageText }) => {
  const [expanded, setExpanded] = useState(false);
  const threshold = 250; // character count threshold
  
  if (!text) return null;
  
  const formatted = formatPassageText(text);
  const shouldTruncate = text.length > threshold;
  const displayedText = (shouldTruncate && !expanded) 
    ? `${formatted.slice(0, threshold)}...` 
    : formatted;
    
  return (
    <Box>
      <Typography 
        variant="body2" 
        sx={{ 
          fontStyle: 'italic', 
          lineHeight: 1.8, 
          bgcolor: 'action.hover', 
          p: 2, 
          borderRadius: 2,
          borderLeft: '4px solid #6366F1',
          whiteSpace: 'pre-wrap'
        }}
      >
        "... {displayedText} ..."
      </Typography>
      {shouldTruncate && (
        <Button 
          size="small" 
          onClick={() => setExpanded(!expanded)} 
          sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
        >
          {expanded ? 'Show Less' : 'Read Full Passage'}
        </Button>
      )}
    </Box>
  );
};

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const cleanFilename = (filename) => {
    if (!filename) return '';
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
    let clean = filename;
    clean = clean.replace(uuidRegex, '');
    clean = clean.replace(uuidRegex, '');
    return clean;
  };

  const formatPassageText = (text) => {
    if (!text) return '';
    let formatted = text;
    const labels = [
      "Ticket No.", "Train", "From", "To", "Journey Date", "Departure", 
      "Arrival", "Boarding Deadline", "Seat", "Status", "Note:", "Amount", 
      "Date", "Invoice", "Total", "Subtotal", "Tax", "Notice Period",
      "Effective Date", "Termination Date", "Contract", "Agreement"
    ];
    labels.forEach(label => {
      const regex = new RegExp(`\\b(${label})\\b`, 'g');
      formatted = formatted.replace(regex, '\n$1');
    });
    return formatted.trim();
  };

  const paginatedResults = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return results.slice(startIndex, startIndex + itemsPerPage);
  }, [results, page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setPage(1);
    try {
      const formData = new FormData();
      formData.append('query', query);
      const res = await api.post('/api/ai/search', formData);
      setResults(res.data);
      if (res.data.length === 0) {
        toast.info('No matching text passages found.');
      }
    } catch (err) {
      toast.error('Semantic search failed. Check backend connections.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          Semantic Query Explorer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Retrieve relevant document sections by concept meaning instead of exact keywords
        </Typography>
      </Box>

      {/* Input bar */}
      <Card sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              placeholder="e.g. What is our policy on contract termination deadlines and notice periods?"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={searching}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={searching || !query.trim()}
              startIcon={<SearchIcon />}
              sx={{ px: 3, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
            >
              {searching ? <CircularProgress size={24} color="inherit" /> : 'Search'}
            </Button>
          </Box>
        </form>
      </Card>

      {/* Results panel */}
      {searching ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Running vector similarity search across documents...</Typography>
        </Box>
      ) : results.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            py: 10,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 3
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
            Ready for Semantic Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a conceptual sentence above to query matches based on contextual embedding vectors.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Retrieved Passages ({results.length})
          </Typography>
          {paginatedResults.map((result, idx) => (
            <Card key={idx} variant="outlined" sx={{ borderRadius: 3, position: 'relative' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DocIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Source: {cleanFilename(result.metadata?.source) || 'Unknown file'}
                    </Typography>
                  </Box>
                  <Chip label={`Match #${(page - 1) * itemsPerPage + idx + 1}`} size="small" color="secondary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <ExpandablePassage text={result.page_content} formatPassageText={formatPassageText} />
              </CardContent>
            </Card>
          ))}
          {results.length > itemsPerPage && (
            <Box display="flex" justifyContent="center" mt={1} mb={2}>
              <Pagination
                count={Math.ceil(results.length / itemsPerPage)}
                page={page}
                onChange={(e, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SemanticSearch;
