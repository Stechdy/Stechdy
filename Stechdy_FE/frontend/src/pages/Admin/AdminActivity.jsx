import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch activities');

      const data = await response.json();
      setActivities(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Vừa xong';
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    // Less than 7 days
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration': return '👤';
      case 'payment': return '💳';
      case 'login': return '🔑';
      case 'study': return '📚';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'registration': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'login': return '#8b5cf6';
      case 'study': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Nhật ký hoạt động</h1>
        <p className="admin-page-subtitle">Theo dõi hoạt động gần đây trên hệ thống</p>
      </div>

      <div className="admin-filters">
        <button className="admin-btn admin-btn-primary" onClick={fetchActivities}>
          🔄 Làm mới
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📝</div>
              <div className="admin-empty-title">Không có hoạt động</div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '0',
                bottom: '0',
                width: '2px',
                background: '#e5e7eb'
              }} />

              {/* Activities */}
              {activities.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px 0',
                    position: 'relative'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'white',
                    border: `3px solid ${getActivityColor(activity.type)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    zIndex: 1,
                    flexShrink: 0
                  }}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '4px' }}>
                          {activity.user}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
                          {activity.description}
                          {activity.amount && (
                            <span style={{ 
                              marginLeft: '8px', 
                              fontWeight: 600, 
                              color: '#10b981' 
                            }}>
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                          {activity.email}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="admin-stats-grid" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-stat-card blue">
          <div className="stat-icon">👤</div>
          <div className="stat-value">
            {activities.filter(a => a.type === 'registration').length}
          </div>
          <div className="stat-label">Đăng ký mới</div>
        </div>

        <div className="admin-stat-card green">
          <div className="stat-icon">💳</div>
          <div className="stat-value">
            {activities.filter(a => a.type === 'payment').length}
          </div>
          <div className="stat-label">Thanh toán</div>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon">🔑</div>
          <div className="stat-value">
            {activities.filter(a => a.type === 'login').length}
          </div>
          <div className="stat-label">Đăng nhập</div>
        </div>

        <div className="admin-stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{activities.length}</div>
          <div className="stat-label">Tổng hoạt động</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
