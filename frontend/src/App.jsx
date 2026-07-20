import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress } from '@mui/material';

// Contexts
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

// Themes
import { getTheme } from './theme';

// Layout & Security
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Views
import LandingPage from './views/Auth/LandingPage';
import Login from './views/Auth/Login';
import ForgotPassword from './views/Auth/ForgotPassword';
import ResetPassword from './views/Auth/ResetPassword';

import DashboardRouter from './views/Dashboard/DashboardRouter';
import DocumentRepository from './views/Documents/DocumentRepository';
import ChatWithDocs from './views/AI/ChatWithDocs';
import Summarizer from './views/AI/Summarizer';
import SemanticSearch from './views/AI/SemanticSearch';
import DeadlineExtractor from './views/AI/DeadlineExtractor';
import ImageAnalyzer from './views/AI/ImageAnalyzer';
import CircuitAnalyzer from './views/AI/CircuitAnalyzer';
import DepartmentManagement from './views/Departments/DepartmentManagement';
import UserManagement from './views/Users/UserManagement';
import AuditLogs from './views/Logs/AuditLogs';
import ProfileSettings from './views/Settings/ProfileSettings';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const HomeIndex = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    if (location.pathname === '/') {
      return <LandingPage />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />;
};

const AppContent = () => {
  const { mode } = useContext(ThemeContext);
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Views */}
          <Route path="/" element={<HomeIndex />}>
            {/* Dynamic Dashboard */}
            <Route index element={<DashboardRouter />} />
            
            {/* Repository */}
            <Route path="documents" element={<DocumentRepository />} />
            
            {/* AI Tools */}
            <Route path="ai-chat" element={<ChatWithDocs />} />
            <Route path="summarizer" element={<Summarizer />} />
            <Route path="semantic-search" element={<SemanticSearch />} />
            <Route path="deadlines" element={<DeadlineExtractor />} />
            <Route path="image-analysis" element={<ImageAnalyzer />} />
            <Route path="circuit-analysis" element={<CircuitAnalyzer />} />
            
            {/* Fallback Analytics mappings */}
            <Route path="analytics" element={<DashboardRouter />} />

            {/* Admin/Manager Operations */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Profile Settings */}
            <Route path="settings" element={<ProfileSettings />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={4000} theme={mode} />
    </MuiThemeProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
