import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import './AdminLayout.css';
import '../../styles/AdminTheme.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useAdminTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng' },
    { path: '/admin/payments', icon: '💳', label: 'Quản lý thanh toán' },
    { path: '/admin/discounts', icon: '🎫', label: 'Mã Discount' },
    { path: '/admin/revenue', icon: '📈', label: 'Thống kê doanh thu' },
    { path: '/admin/reports', icon: '📋', label: 'Báo cáo hàng tháng' },
    { path: '/admin/notifications', icon: '🔔', label: 'Thông báo hệ thống' },
    { path: '/admin/activity', icon: '📝', label: 'Nhật ký hoạt động' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">S-Techdy Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{user.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user.name || 'Admin'}</span>
              <span className="admin-user-role">{user.role || 'admin'}</span>
            </div>
          </div>
          
          <div className="admin-footer-actions">
            <button className="admin-theme-toggle" onClick={handleThemeToggle} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <span>{isDark ? '☀️' : '🌙'}</span>
            </button>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
