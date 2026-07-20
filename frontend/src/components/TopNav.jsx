import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Sun as LightIcon,
  Moon as DarkIcon,
  Bell as BellIcon,
  Dot as UnreadIcon
} from 'lucide-react';

const TopNav = ({ handleDrawerToggle, toggleCollapse, collapsed }) => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/unread');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenNotificationsMenu = (event) => setAnchorElNotifications(event.currentTarget);
  const handleCloseNotificationsMenu = () => setAnchorElNotifications(null);

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
        
        {/* Left Toggles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon size={20} />
          </IconButton>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleCollapse}
            sx={{ mr: 1, display: { xs: 'none', md: 'inline-flex' } }}
          >
            <MenuIcon size={20} />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' }, color: 'primary.main', letterSpacing: '-0.5px' }}
          >
            {user?.role === 'ADMIN' ? 'Platform Administration' : `${user?.departmentName} Portal`}
          </Typography>
        </Box>

        {/* Right Menu Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          
          {/* Light/Dark Toggle */}
          <Tooltip title="Toggle Theme">
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightIcon size={20} /> : <DarkIcon size={20} />}
            </IconButton>
          </Tooltip>

          {/* Notifications Bell */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
              <Badge badgeContent={notifications.length} color="error">
                <BellIcon size={20} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Notifications Dropdown Menu */}
          <Menu
            anchorEl={anchorElNotifications}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationsMenu}
            PaperProps={{
              sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1.5 }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Notifications ({notifications.length})
              </Typography>
              {notifications.length > 0 && (
                <Typography 
                  variant="caption" 
                  color="primary" 
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                  onClick={markAllNotificationsAsRead}
                >
                  Mark all as read
                </Typography>
              )}
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No new notifications.
                  </Typography>
                </Box>
              ) : (
                notifications.map((notif) => (
                  <ListItem 
                    key={notif.id} 
                    alignItems="flex-start"
                    button
                    onClick={() => handleNotificationClick(notif.id)}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                      <UnreadIcon color="primary" size={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {notif.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Menu>

          {/* User Profile Avatar */}
          <Tooltip title="User Profile">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, fontSize: '0.95rem' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              sx: { borderRadius: 3, width: 220, mt: 1 }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleCloseUserMenu(); window.location.href = '/settings'; }}>Profile Settings</MenuItem>
            <Divider />
            <MenuItem onClick={logout} sx={{ color: 'error.main' }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
