import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Box } from '@mui/material';

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav 
        handleDrawerToggle={handleDrawerToggle} 
        toggleCollapse={toggleCollapse} 
        collapsed={collapsed} 
      />
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        collapsed={collapsed} 
        toggleCollapse={toggleCollapse} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { md: `calc(100% - ${collapsed ? 80 : 260}px)` },
          transition: 'width 0.2s ease',
          mt: '64px',
          overflowX: 'hidden'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
