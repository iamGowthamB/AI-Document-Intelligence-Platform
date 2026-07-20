import React, { useState, useContext, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Card,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  Paper,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Description as DocIcon,
  Send as SendIcon,
  Psychology as AiIcon,
  Person as UserIcon,
  RadioButtonChecked as SelectedIcon,
  RadioButtonUnchecked as UnselectedIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ChatWithDocs = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch Department Documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['chatDocuments'],
    queryFn: async () => {
      const res = await api.get('/api/documents');
      // Only approved documents can be queried
      return res.data.filter(doc => doc.status === 'APPROVED');
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = { sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/api/ai/chat', {
        question: input,
        documentId: selectedDocId
      });

      const aiMsg = { sender: 'ai', text: res.data.answer, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to get response from AI Engine.');
      const errMsg = { sender: 'ai', text: 'Error: Could not retrieve answer. Make sure the AI Engine backend is running.', timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Grid container spacing={3} sx={{ height: 'calc(100vh - 140px)' }}>
      
      {/* Left Panel: Available Documents */}
      <Grid item xs={12} md={4} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Context Documents
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Select a specific document to lock context, or query across the whole department database.
          </Typography>
          <Divider />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)', mt: 1 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : documents?.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">No indexed files found.</Typography>
              </Box>
            ) : (
              <List>
                <ListItem disablePadding>
                  <ListItemButton 
                    selected={selectedDocId === null}
                    onClick={() => setSelectedDocId(null)}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon>
                      {selectedDocId === null ? <SelectedIcon color="primary" /> : <UnselectedIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Entire Department Database" 
                      primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} 
                    />
                  </ListItemButton>
                </ListItem>
                
                {documents?.map((doc) => (
                  <ListItem key={doc.id} disablePadding>
                    <ListItemButton
                      selected={selectedDocId === doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemIcon>
                        {selectedDocId === doc.id ? <SelectedIcon color="primary" /> : <DocIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.category} • v${doc.version}`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Right Panel: Chat Thread */}
      <Grid item xs={12} md={8} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AiIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Intelligent RAG Assistant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDocId 
                  ? `Focusing on document: "${documents?.find(d => d.id === selectedDocId)?.name}"` 
                  : 'Context window: All approved department documents'}
              </Typography>
            </Box>
          </Box>
          <Divider />

          {/* Chat scrolling feed */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ m: 'auto', textAlign: 'center', maxWidth: 360 }}>
                <AiIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.8, mb: 1.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Start Contextual Dialogue
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Ask questions about deadlines, guidelines, formulas, or general records. The AI will cite source contexts.
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    gap: 1.5
                  }}
                >
                  {msg.sender === 'ai' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <AiIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: msg.sender === 'user' ? '#fff' : 'text.primary',
                      borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '2px 18px 18px 18px',
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                  </Paper>
                  {msg.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      <UserIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              ))
            )}

            {sending && (
              <Box sx={{ display: 'flex', alignSelf: 'flex-start', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <CircularProgress size={16} color="inherit" />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: '2px 18px 18px 18px' }}>
                  <Typography variant="body2" color="text.secondary">Synthesizing context, please wait...</Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Message Input Box */}
          <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask a question..."
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              autoComplete="off"
            />
            <IconButton 
              type="submit" 
              color="primary" 
              disabled={!input.trim() || sending}
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ChatWithDocs;
