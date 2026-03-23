import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { getHardcodedRevenueStats } from '../../constants/adminHardcodedData';

const AdminRevenue = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchRevenueStats = useCallback(async () => {
    try {
      setLoading(true);
      setStats(getHardcodedRevenueStats(period, year));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [period, year]);

  useEffect(() => {
    fetchRevenueStats();
  }, [fetchRevenueStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getMonthName = (monthNum) => {
    const months = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[monthNum] || `Tháng ${monthNum}`;
  };

  const getPeriodLabel = (item) => {
    if (period === 'daily') {
      return `${item._id.day}/${item._id.month}`;
    } else if (period === 'weekly') {
      return `Tuần ${item._id.week}`;
    } else {
      return getMonthName(item._id.month);
    }
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = stats?.revenueByPeriod?.reduce((max, item) => 
    Math.max(max, item.revenue), 0) || 0;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Thống kê doanh thu</h1>
        <p className="admin-page-subtitle">Phân tích chi tiết doanh thu theo thời gian</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select
          className="admin-filter-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="daily">Theo ngày</option>
          <option value="weekly">Theo tuần</option>
          <option value="monthly">Theo tháng</option>
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

        <button className="admin-btn admin-btn-primary" onClick={fetchRevenueStats}>
          🔄 Làm mới
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="admin-stat-card green">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{formatCurrency(stats?.summary?.totalRevenue || 0)}</div>
              <div className="stat-label">Tổng doanh thu {year}</div>
            </div>

            <div className="admin-stat-card purple">
              <div className="stat-icon">📊</div>
              <div className="stat-value">{stats?.summary?.totalTransactions || 0}</div>
              <div className="stat-label">Số giao dịch</div>
            </div>

            <div className="admin-stat-card blue">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{formatCurrency(stats?.summary?.avgTransaction || 0)}</div>
              <div className="stat-label">Giao dịch trung bình</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="admin-card" style={{ marginTop: '24px' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <span>📈</span> Biểu đồ doanh thu
              </h3>
            </div>
            <div className="admin-card-body">
              {stats?.revenueByPeriod?.length > 0 ? (
                <div style={{ padding: '20px 0' }}>
                  {/* Simple bar chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '250px', padding: '0 20px' }}>
                    {stats.revenueByPeriod.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '60px',
                            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px 8px 0 0',
                            height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0}px`,
                            minHeight: item.revenue > 0 ? '20px' : '0',
                            transition: 'height 0.3s ease',
                            position: 'relative'
                          }}
                          title={`${getPeriodLabel(item)}: ${formatCurrency(item.revenue)}`}
                        >
                          {item.revenue > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '-24px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '10px',
                              fontWeight: '600',
                              color: '#374151',
                              whiteSpace: 'nowrap'
                            }}>
                              {(item.revenue / 1000000).toFixed(1)}M
                            </div>
                          )}
                        </div>
                        <div style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          {getPeriodLabel(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-icon">📊</div>
                  <div className="admin-empty-text">Chưa có dữ liệu doanh thu trong năm {year}</div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Plan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <span>💎</span> Doanh thu theo gói
                </h3>
              </div>
              <div className="admin-card-body">
                {stats?.revenueByPlan?.length > 0 ? (
                  <div>
                    {stats.revenueByPlan.map((plan, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          background: index % 2 === 0 ? '#f9fafb' : 'white',
                          borderRadius: '10px',
                          marginBottom: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
                            {plan.planName || plan._id}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {plan.count} giao dịch
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '18px',
                          color: '#10b981'
                        }}>
                          {formatCurrency(plan.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <div className="admin-empty-text">Chưa có dữ liệu</div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Table */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <span>📋</span> Chi tiết theo thời gian
                </h3>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                {stats?.revenueByPeriod?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Giao dịch</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.revenueByPeriod.map((item, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 500 }}>{getPeriodLabel(item)}</td>
                          <td>{item.count}</td>
                          <td style={{ fontWeight: 600, color: '#10b981' }}>
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty">
                    <div className="admin-empty-text">Chưa có dữ liệu</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminRevenue;
