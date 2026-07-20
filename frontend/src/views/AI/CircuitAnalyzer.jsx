import React, { useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  ElectricalServices as CircuitIcon,
  Psychology as AiIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const CircuitAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [question, setQuestion] = useState('Identify all electrical components, connections, signal paths, and summarize the overall functional operation of this schematic diagram.');
  const [answer, setAnswer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !question.trim()) return;

    setAnalyzing(true);
    setAnswer('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    try {
      const res = await api.post('/api/ai/circuit-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnswer(res.data.answer);
      toast.success('Circuit diagram analyzed successfully.');
    } catch (err) {
      toast.error('Circuit analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          AI Intelligent Circuit Schematic Analyzer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Explain electronic/electrical schematics, component nodes, and device functions using local Qwen VL model
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Upload and Prompt */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Schematic Image
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              sx={{ py: filePreview ? 1 : 6, borderStyle: 'dashed', borderWidth: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {filePreview ? (
                <img src={filePreview} alt="Upload preview" style={{ maxWidth: '100%', maxHeight: '20vh', borderRadius: 8 }} />
              ) : (
                <>
                  <CircuitIcon sx={{ fontSize: 32 }} />
                  Select Schematic Image
                </>
              )}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            <TextField
              label="Schematic Questions"
              multiline
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about active components, feedback loops, or voltage rails..."
            />

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={!file || !question.trim() || analyzing}
              sx={{ py: 1.25, mt: 'auto', background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
            >
              {analyzing ? <CircularProgress size={24} color="inherit" /> : 'Run Circuit Explanation'}
            </Button>
          </Card>
        </Grid>

        {/* Right: Explanation output */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiIcon color="primary" /> Circuit Analysis & Observations
            </Typography>
            <Divider />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
              {analyzing ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">Evaluating schematic topology (using local GPU context)...</Typography>
                </Box>
              ) : !answer ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <CircuitIcon sx={{ fontSize: 48, opacity: 0.6, mb: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>No Analysis Results</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Upload a schematic diagram on the left to extract operation logs.</Typography>
                </Box>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3, minHeight: '85%' }}>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {answer}
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

export default CircuitAnalyzer;
