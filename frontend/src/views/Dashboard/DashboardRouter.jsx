import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardRouter;
