import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

import config from '../../config';
const API_BASE_URL = config.apiUrl;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-empty">
          <div className="admin-empty-icon">❌</div>
          <div className="admin-empty-title">Có lỗi xảy ra</div>
          <div className="admin-empty-text">{error}</div>
          <button className="admin-btn admin-btn-primary" onClick={fetchDashboardStats} style={{ marginTop: '16px' }}>
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Tổng quan hệ thống S-Techdy</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.users?.total || 0}</div>
          <div className="stat-label">Tổng người dùng</div>
          <span className={`stat-change ${parseFloat(stats?.users?.growthRate) >= 0 ? 'positive' : 'negative'}`}>
            {parseFloat(stats?.users?.growthRate) >= 0 ? '↑' : '↓'} {Math.abs(stats?.users?.growthRate || 0)}%
            <span style={{ fontWeight: 400, marginLeft: '4px' }}>so với tháng trước</span>
          </span>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-icon">💎</div>
          <div className="stat-value">{stats?.users?.premium || 0}</div>
          <div className="stat-label">Người dùng Premium</div>
          <span className="stat-change positive">
            {stats?.users?.total > 0 
              ? ((stats?.users?.premium / stats?.users?.total) * 100).toFixed(1) 
              : 0}% tổng users
          </span>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats?.revenue?.thisMonth || 0)}</div>
          <div className="stat-label">Doanh thu tháng này</div>
          <span className={`stat-change ${parseFloat(stats?.revenue?.growthRate) >= 0 ? 'positive' : 'negative'}`}>
            {parseFloat(stats?.revenue?.growthRate) >= 0 ? '↑' : '↓'} {Math.abs(stats?.revenue?.growthRate || 0)}%
            <span style={{ fontWeight: 400, marginLeft: '4px' }}>so với tháng trước</span>
          </span>
        </div>

        <div className="admin-stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats?.revenue?.pendingPayments || 0}</div>
          <div className="stat-label">Thanh toán chờ xử lý</div>
          <span className="stat-change" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            Cần duyệt
          </span>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="admin-stats-grid" style={{ marginTop: '20px' }}>
        <div className="admin-stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats?.studySessions?.total || 0}</div>
          <div className="stat-label">Tổng buổi học</div>
          <span className="stat-change positive">
            {stats?.studySessions?.completionRate || 0}% hoàn thành
          </span>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{stats?.studySessions?.totalStudyHours || 0}h</div>
          <div className="stat-label">Tổng giờ học</div>
          <span className="stat-change positive">
            Từ {stats?.studySessions?.completed || 0} buổi
          </span>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon">🆕</div>
          <div className="stat-value">{stats?.users?.newThisMonth || 0}</div>
          <div className="stat-label">Users mới tháng này</div>
          <span className="stat-change positive">
            +{stats?.users?.newLastMonth || 0} tháng trước
          </span>
        </div>

        <div className="admin-stat-card orange">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats?.users?.active || 0}</div>
          <div className="stat-label">Users hoạt động</div>
          <span className="stat-change positive">
            30 ngày gần đây
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Recent Users */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>👥</span> Người dùng mới
            </h3>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {stats?.recentUsers?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} />
                            ) : (
                              user.name?.charAt(0) || '?'
                            )}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.premiumStatus}`}>
                          {user.premiumStatus === 'premium' ? '💎 Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty">
                <div className="admin-empty-icon">👤</div>
                <div className="admin-empty-text">Chưa có người dùng mới</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>💳</span> Thanh toán gần đây
            </h3>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {stats?.recentPayments?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Gói</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{payment.userName}</div>
                          <div className="user-email">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{payment.planName}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>
                        <span className={`status-badge ${payment.status}`}>
                          {payment.status === 'pending' && '⏳ Chờ duyệt'}
                          {payment.status === 'verified' && '✅ Đã duyệt'}
                          {payment.status === 'rejected' && '❌ Từ chối'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty">
                <div className="admin-empty-icon">💳</div>
                <div className="admin-empty-text">Chưa có thanh toán nào</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>⚡</span> Thao tác nhanh
          </h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="admin-btn admin-btn-primary" onClick={() => window.location.href = '/admin/users'}>
              👥 Quản lý người dùng
            </button>
            <button className="admin-btn admin-btn-primary" onClick={() => window.location.href = '/admin/payments'}>
              💳 Duyệt thanh toán ({stats?.revenue?.pendingPayments || 0})
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={() => window.location.href = '/admin/reports'}>
              📊 Xem báo cáo tháng
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={() => window.location.href = '/admin/notifications'}>
              🔔 Gửi thông báo
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
