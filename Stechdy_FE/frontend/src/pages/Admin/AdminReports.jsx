import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';

import config from '../../config';
const API_BASE_URL = config.apiUrl;

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/admin/reports/monthly?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch report');

      const data = await response.json();
      setReport(data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const handleExport = () => {
    // Generate report text
    const reportText = `
BÁO CÁO THÁNG ${report?.period?.month}/${report?.period?.year}
=====================================

1. NGƯỜI DÙNG
- Người dùng mới: ${report?.users?.newUsers || 0}
- Tăng trưởng: ${report?.users?.growthRate || 0}%
- Chuyển đổi Premium: ${report?.users?.premiumConversions || 0}

2. DOANH THU
- Tổng doanh thu: ${formatCurrency(report?.revenue?.total || 0)}
- Số giao dịch: ${report?.revenue?.transactions || 0}
- Tăng trưởng: ${report?.revenue?.growthRate || 0}%

3. HOẠT ĐỘNG HỌC TẬP
- Tổng buổi học: ${report?.studySessions?.total || 0}
- Hoàn thành: ${report?.studySessions?.completed || 0}
- Tỷ lệ hoàn thành: ${report?.studySessions?.completionRate || 0}%
- Tổng giờ học: ${report?.studySessions?.totalHours || 0}h

4. TOP USERS
${report?.topUsers?.map((u, i) => `${i + 1}. ${u.user?.name} - ${Math.round(u.totalMinutes / 60)}h`).join('\n') || 'Không có dữ liệu'}
    `.trim();

    // Download
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-thang-${month}-${year}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Báo cáo hàng tháng</h1>
        <p className="admin-page-subtitle">Tổng hợp số liệu theo tháng</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select
          className="admin-filter-select"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          className="admin-filter-select"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button className="admin-btn admin-btn-primary" onClick={fetchReport}>
          🔄 Làm mới
        </button>

        <button className="admin-btn admin-btn-secondary" onClick={handleExport} disabled={!report}>
          📥 Xuất báo cáo
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Đang tải báo cáo...</p>
        </div>
      ) : report ? (
        <>
          {/* Report Header */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-body report-header-card">
              <h2 className="report-title">
                📊 BÁO CÁO THÁNG {report.period?.month}/{report.period?.year}
              </h2>
              <p className="report-subtitle">
                {report.period?.monthName}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card blue">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{report.users?.newUsers || 0}</div>
              <div className="stat-label">Người dùng mới</div>
              <span className={`stat-change ${parseFloat(report.users?.growthRate) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(report.users?.growthRate) >= 0 ? '↑' : '↓'} {Math.abs(report.users?.growthRate || 0)}%
              </span>
            </div>

            <div className="admin-stat-card green">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{formatCurrency(report.revenue?.total || 0)}</div>
              <div className="stat-label">Doanh thu</div>
              <span className={`stat-change ${parseFloat(report.revenue?.growthRate) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(report.revenue?.growthRate) >= 0 ? '↑' : '↓'} {Math.abs(report.revenue?.growthRate || 0)}%
              </span>
            </div>

            <div className="admin-stat-card purple">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{report.studySessions?.completed || 0}</div>
              <div className="stat-label">Buổi học hoàn thành</div>
              <span className="stat-change positive">
                {report.studySessions?.completionRate || 0}% tỷ lệ
              </span>
            </div>

            <div className="admin-stat-card orange">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{report.studySessions?.totalHours || 0}h</div>
              <div className="stat-label">Tổng giờ học</div>
              <span className="stat-change positive">
                {report.studySessions?.total || 0} buổi
              </span>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="report-sections-grid">
            {/* Revenue by Plan */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <span>💎</span> Doanh thu theo gói
                </h3>
              </div>
              <div className="admin-card-body">
                {report.revenue?.byPlan?.length > 0 ? (
                  <div>
                    {report.revenue.byPlan.map((plan, index) => (
                      <div key={index} className="plan-item">
                        <div>
                          <div className="plan-info-title">
                            {plan.planName || plan._id}
                          </div>
                          <div className="plan-info-subtitle">
                            {plan.count} giao dịch
                          </div>
                        </div>
                        <div className="plan-revenue">
                          {formatCurrency(plan.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <div className="admin-empty-text">Không có dữ liệu</div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Users */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <span>🏆</span> Top người dùng học nhiều nhất
                </h3>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                {report.topUsers?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Người dùng</th>
                        <th>Giờ học</th>
                        <th>Buổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topUsers.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && (index + 1)}
                          </td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {item.user?.avatarUrl ? (
                                  <img src={item.user.avatarUrl} alt={item.user?.name} />
                                ) : (
                                  item.user?.name?.charAt(0) || '?'
                                )}
                              </div>
                              <div className="user-info">
                                <div className="user-name">{item.user?.name || 'N/A'}</div>
                                <div className="user-email">{item.user?.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="hours-column">
                            {Math.round(item.totalMinutes / 60)}h
                          </td>
                          <td>{item.sessionsCompleted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty">
                    <div className="admin-empty-text">Không có dữ liệu</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="admin-card" style={{ marginTop: '24px' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <span>📊</span> So sánh với tháng trước
              </h3>
            </div>
            <div className="admin-card-body">
              <div className="comparison-grid">
                <div className="comparison-item">
                  <div className="comparison-label">Người dùng mới</div>
                  <div className="comparison-value">{report.users?.newUsers || 0}</div>
                  <div className="comparison-info">
                    vs {report.users?.previousNewUsers || 0} tháng trước
                  </div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">Doanh thu</div>
                  <div className="comparison-value success">
                    {formatCurrency(report.revenue?.total || 0)}
                  </div>
                  <div className="comparison-info">
                    vs {formatCurrency(report.revenue?.previous || 0)} tháng trước
                  </div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">Giao dịch</div>
                  <div className="comparison-value">{report.revenue?.transactions || 0}</div>
                  <div className="comparison-info">
                    thanh toán thành công
                  </div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">Premium mới</div>
                  <div className="comparison-value purple">
                    {report.users?.premiumConversions || 0}
                  </div>
                  <div className="comparison-info">
                    chuyển đổi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="admin-empty">
          <div className="admin-empty-icon">📋</div>
          <div className="admin-empty-title">Không có dữ liệu báo cáo</div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
