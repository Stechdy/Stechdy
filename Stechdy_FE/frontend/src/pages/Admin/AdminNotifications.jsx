import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';

import config from '../../config';
const API_BASE_URL = config.apiUrl;

const AdminNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetUsers: 'all'
  });
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    const confirmMessage = form.targetUsers === 'all' 
      ? 'Xác nhận gửi thông báo đến tất cả người dùng?' 
      : form.targetUsers === 'premium'
      ? 'Xác nhận gửi thông báo đến người dùng Premium?'
      : 'Xác nhận gửi thông báo đến người dùng Free?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send notification');
      }

      alert(`✅ Đã gửi thông báo đến ${data.count} người dùng!`);
      
      // Add to history
      setHistory([
        {
          ...form,
          sentAt: new Date().toISOString(),
          count: data.count
        },
        ...history
      ]);
      
      // Reset form
      setForm({ title: '', message: '', targetUsers: 'all' });
    } catch (err) {
      console.error('Error sending notification:', err);
      alert(`Có lỗi xảy ra khi gửi thông báo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Thông báo hệ thống</h1>
        <p className="admin-page-subtitle">Gửi thông báo đến người dùng</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Send Notification Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>📤</span> Gửi thông báo mới
            </h3>
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Đối tượng nhận</label>
                <select
                  className="admin-form-input"
                  value={form.targetUsers}
                  onChange={(e) => setForm({ ...form, targetUsers: e.target.value })}
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="premium">Chỉ Premium</option>
                  <option value="free">Chỉ Free</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Nhập tiêu đề..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={100}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {form.title.length}/100 ký tự
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Nội dung thông báo *</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  placeholder="Nhập nội dung thông báo..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={500}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {form.message.length}/500 ký tự
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? '⏳ Đang gửi...' : '📤 Gửi thông báo'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setForm({ title: '', message: '', targetUsers: 'all' })}
                >
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notification Preview */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>👁️</span> Xem trước
            </h3>
          </div>
          <div className="admin-card-body">
            <div style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  🔔
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {form.title || 'Tiêu đề thông báo'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    S-Techdy System
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.6
              }}>
                {form.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}
              </div>
              <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                {form.targetUsers === 'all' && '👥 Gửi đến tất cả người dùng'}
                {form.targetUsers === 'premium' && '💎 Gửi đến người dùng Premium'}
                {form.targetUsers === 'free' && '🆓 Gửi đến người dùng Free'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>📜</span> Lịch sử gửi (phiên hiện tại)
          </h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {history.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tiêu đề</th>
                  <th>Đối tượng</th>
                  <th>Số người nhận</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(item.sentAt)}
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td>
                      <span className={`status-badge ${item.targetUsers === 'premium' ? 'premium' : 'active'}`}>
                        {item.targetUsers === 'all' && '👥 Tất cả'}
                        {item.targetUsers === 'premium' && '💎 Premium'}
                        {item.targetUsers === 'free' && '🆓 Free'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📭</div>
              <div className="admin-empty-text">Chưa có thông báo nào được gửi</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <span>📝</span> Mẫu nhanh
          </h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setForm({
                title: '🎉 Khuyến mãi đặc biệt!',
                message: 'Nâng cấp Premium ngay hôm nay để nhận ưu đãi giảm 30%! Chỉ áp dụng trong tuần này.',
                targetUsers: 'free'
              })}
            >
              🏷️ Khuyến mãi
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setForm({
                title: '📢 Cập nhật hệ thống',
                message: 'Hệ thống sẽ bảo trì vào lúc 2:00 - 4:00 sáng ngày mai. Xin lỗi vì sự bất tiện!',
                targetUsers: 'all'
              })}
            >
              🔧 Bảo trì
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setForm({
                title: '✨ Tính năng mới!',
                message: 'Chúng tôi vừa ra mắt tính năng AI Study Assistant mới! Trải nghiệm ngay trên ứng dụng.',
                targetUsers: 'all'
              })}
            >
              🆕 Tính năng mới
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setForm({
                title: '💎 Cảm ơn bạn!',
                message: 'Cảm ơn bạn đã tin tưởng sử dụng S-Techdy Premium! Chúng tôi trân trọng sự ủng hộ của bạn.',
                targetUsers: 'premium'
              })}
            >
              💖 Tri ân Premium
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
