import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(premiumFilter !== 'all' && { premiumStatus: premiumFilter }),
        ...(statusFilter !== 'all' && { isActive: statusFilter })
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, premiumFilter, statusFilter, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const fetchUserDetails = async (userId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const data = await response.json();
      setUserDetails(data.data);
      setShowModal(true);
    } catch (err) {
      alert('Không thể tải thông tin người dùng');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Xác nhận ${currentStatus ? 'VÔ HIỆU HÓA' : 'KÍCH HOẠT'} tài khoản này?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update user status');

      fetchUsers(pagination.current);
      alert(currentStatus ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
    } catch (err) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Xác nhận đổi role thành "${newRole}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to change user role');

      fetchUsers(pagination.current);
      alert(`Đã đổi role thành ${newRole}`);
    } catch (err) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`XÓA VĨNH VIỄN tài khoản "${userName}"?\n\nHành động này không thể hoàn tác!`)) return;
    if (!window.confirm('Xác nhận lần cuối: BẠN CHẮC CHẮN MUỐN XÓA?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      fetchUsers(pagination.current);
      alert('Đã xóa tài khoản');
    } catch (err) {
      alert('Có lỗi xảy ra');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý người dùng</h1>
        <p className="admin-page-subtitle">Quản lý và xem thông tin chi tiết người dùng</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="admin-filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả role</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>

        <select
          className="admin-filter-select"
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value)}
        >
          <option value="all">Tất cả gói</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>

        <select
          className="admin-filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Ngày tạo</option>
          <option value="lastLogin">Lần đăng nhập</option>
          <option value="name">Tên</option>
        </select>

        <button 
          className="admin-btn admin-btn-secondary"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          {sortOrder === 'desc' ? '↓ Giảm' : '↑ Tăng'}
        </button>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👤</div>
              <div className="admin-empty-title">Không tìm thấy người dùng</div>
              <div className="admin-empty-text">Thử thay đổi bộ lọc</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Role</th>
                  <th>Gói</th>
                  <th>Trạng thái</th>
                  <th>Streak</th>
                  <th>Level</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${user.premiumStatus}`}>
                        {user.premiumStatus === 'premium' ? '💎 Premium' : 'Free'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? '✅ Hoạt động' : '🚫 Bị khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      🔥 {user.streakCount || 0}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      ⭐ {user.level || 1}
                    </td>
                    <td style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => {
                            setSelectedUser(user);
                            fetchUserDetails(user._id);
                          }}
                        >
                          👁️
                        </button>
                        <button
                          className={`admin-btn admin-btn-sm ${user.isActive ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDeleteUser(user._id, user.name)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="admin-pagination">
              <div className="pagination-info">
                Hiển thị {users.length} / {pagination.total} người dùng
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={pagination.current === 1}
                  onClick={() => fetchUsers(pagination.current - 1)}
                >
                  ← Trước
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${pagination.current === pageNum ? 'active' : ''}`}
                      onClick={() => fetchUsers(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  disabled={pagination.current === pagination.pages}
                  onClick={() => fetchUsers(pagination.current + 1)}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Chi tiết người dùng: {selectedUser?.name}
              </h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              {modalLoading ? (
                <div className="admin-loading">
                  <div className="admin-loading-spinner"></div>
                </div>
              ) : userDetails ? (
                <div>
                  {/* User Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>📋 Thông tin cơ bản</h4>
                      <p><strong>Email:</strong> {userDetails.user.email}</p>
                      <p><strong>Số điện thoại:</strong> {userDetails.user.phone || 'Chưa cập nhật'}</p>
                      <p><strong>Ngày tạo:</strong> {formatDate(userDetails.user.createdAt)}</p>
                      <p><strong>Đăng nhập cuối:</strong> {formatDate(userDetails.user.lastLogin)}</p>
                      <p><strong>Provider:</strong> {userDetails.user.authProvider}</p>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>📊 Thống kê</h4>
                      <p><strong>Tổng giờ học:</strong> {userDetails.statistics.totalStudyHours}h</p>
                      <p><strong>Buổi hoàn thành:</strong> {userDetails.statistics.completedSessions}</p>
                      <p><strong>Số môn học:</strong> {userDetails.statistics.totalSubjects}</p>
                      <p><strong>Tổng thanh toán:</strong> {formatCurrency(userDetails.statistics.totalPayments)}</p>
                      <p><strong>Mood TB:</strong> {userDetails.statistics.avgMoodScore}/5</p>
                    </div>
                  </div>

                  {/* Recent Study Sessions */}
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>📚 Buổi học gần đây</h4>
                  {userDetails.studySessions.length > 0 ? (
                    <table className="admin-table" style={{ marginBottom: '24px' }}>
                      <thead>
                        <tr>
                          <th>Môn học</th>
                          <th>Ngày</th>
                          <th>Thời gian</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.studySessions.slice(0, 5).map((session) => (
                          <tr key={session._id}>
                            <td>{session.subjectId?.name || 'N/A'}</td>
                            <td>{formatDate(session.date)}</td>
                            <td>{session.startTime} - {session.endTime}</td>
                            <td>
                              <span className={`status-badge ${session.status}`}>
                                {session.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Chưa có buổi học nào</p>
                  )}

                  {/* Payments */}
                  <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>💳 Lịch sử thanh toán</h4>
                  {userDetails.payments.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Gói</th>
                          <th>Số tiền</th>
                          <th>Ngày</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.payments.map((payment) => (
                          <tr key={payment._id}>
                            <td>{payment.planName}</td>
                            <td style={{ fontWeight: 600, color: '#10b981' }}>
                              {formatCurrency(payment.amount)}
                            </td>
                            <td>{formatDate(payment.createdAt)}</td>
                            <td>
                              <span className={`status-badge ${payment.status}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#6b7280' }}>Chưa có thanh toán nào</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
