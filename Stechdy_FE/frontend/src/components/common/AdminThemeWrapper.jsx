import React from 'react';
import { AdminThemeProvider } from '../../context/AdminThemeContext';

const AdminThemeWrapper = ({ children }) => {
  return (
    <AdminThemeProvider>
      {children}
    </AdminThemeProvider>
  );
};

export default AdminThemeWrapper;