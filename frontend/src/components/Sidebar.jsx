import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import {
  Layout as DashboardIcon,
  FileText as DescriptionIcon,
  MessageSquare as ChatIcon,
  BookOpen as SummarizeIcon,
  Search as SearchIcon,
  Calendar as DeadlineIcon,
  Image as ImageIcon,
  Cpu as CircuitIcon,
  BarChart2 as AnalyticsIcon,
  Briefcase as DepartmentIcon,
  Users as PeopleIcon,
  ShieldAlert as LogIcon,
  LogOut as LogoutIcon,
  Menu as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-react';

const DRAWER_WIDTH = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle, collapsed, toggleCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [
      { text: 'Dashboard', icon: <DashboardIcon size={20} />, path: '/', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Documents', icon: <DescriptionIcon size={20} />, path: '/documents', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'AI Chat', icon: <ChatIcon size={20} />, path: '/ai-chat', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Summarizer', icon: <SummarizeIcon size={20} />, path: '/summarizer', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Semantic Search', icon: <SearchIcon size={20} />, path: '/semantic-search', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Deadline Extractor', icon: <DeadlineIcon size={20} />, path: '/deadlines', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Image Analysis', icon: <ImageIcon size={20} />, path: '/image-analysis', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Circuit Analysis', icon: <CircuitIcon size={20} />, path: '/circuit-analysis', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Analytics', icon: <AnalyticsIcon size={20} />, path: '/analytics', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      { text: 'Departments', icon: <DepartmentIcon size={20} />, path: '/departments', roles: ['ADMIN', 'MANAGER'] },
      { text: 'Users', icon: <PeopleIcon size={20} />, path: '/users', roles: ['ADMIN'] },
      { text: 'Audit Logs', icon: <LogIcon size={20} />, path: '/audit-logs', roles: ['ADMIN'] },
    ];

    return items.filter(item => user && item.roles.includes(user.role));
  };

  const menuContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}
          >
            A
          </Box>
          {!collapsed && (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-1px' }} className="gradient-text">
              AeroRAG
            </Typography>
          )}
        </Box>
        {!collapsed && (
          <IconButton onClick={toggleCollapse} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            <ChevronLeftIcon size={18} />
          </IconButton>
        )}
      </Box>
      <Divider />

      {/* Nav List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {getMenuItems().map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path === '/'}
                onClick={handleDrawerToggle} // Closes mobile drawer
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: isActive ? '#2563EB' : 'inherit',
                  borderRadius: '10px',
                })}
                sx={{
                  py: 1,
                  px: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: '10px',
                  },
                  justifyContent: collapsed ? 'center' : 'initial'
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 36,
                    mr: collapsed ? 0 : 1,
                    color: 'inherit',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />

      {/* Footer Profile & Logout */}
      <Box sx={{ p: 2 }}>
        {!collapsed && user && (
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.role} • {user.departmentName}
            </Typography>
          </Box>
        )}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            py: 1,
            justifyContent: collapsed ? 'center' : 'center',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': { borderColor: 'error.light', color: 'error.main', bgcolor: 'error.lighter' }
          }}
        >
          {collapsed ? <LogoutIcon size={18} /> : 'Sign Out'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: collapsed ? 80 : DRAWER_WIDTH },
        flexShrink: { md: 0 },
        transition: 'width 0.2s ease',
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {menuContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? 80 : DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'width 0.2s ease',
            overflowX: 'hidden'
          },
        }}
        open
      >
        {menuContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
