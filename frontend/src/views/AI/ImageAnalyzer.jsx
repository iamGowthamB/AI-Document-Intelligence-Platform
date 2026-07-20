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
  Image as ImageIcon,
  Psychology as AiIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ImageAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [question, setQuestion] = useState('Please perform an OCR extraction and summarize the document contents/text details.');
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
      const res = await api.post('/api/ai/image-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnswer(res.data.answer);
      toast.success('Image analyzed successfully.');
    } catch (err) {
      toast.error('Image analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          AI Multimodal Image Analyzer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyze diagrams, graphs, scans, and blueprints using Gemini Vision API
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Upload and Prompt */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '70vh', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Image Details
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
                  <ImageIcon sx={{ fontSize: 32 }} />
                  Select Image File
                </>
              )}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            <TextField
              label="Question / Instruction"
              multiline
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Extract the table contents and format them as markdown..."
            />

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={!file || !question.trim() || analyzing}
              sx={{ py: 1.25, mt: 'auto', background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
            >
              {analyzing ? <CircularProgress size={24} color="inherit" /> : 'Run Image Analysis'}
            </Button>
          </Card>
        </Grid>

        {/* Right: Explanation output */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiIcon color="primary" /> Analysis Results
            </Typography>
            <Divider />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
              {analyzing ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">Reading image vectors and generating analysis...</Typography>
                </Box>
              ) : !answer ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                  <ImageIcon sx={{ fontSize: 48, opacity: 0.6, mb: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>No Analysis Results</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Upload an image on the left and run analysis.</Typography>
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

export default ImageAnalyzer;
