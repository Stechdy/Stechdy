import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import config from "../../config";
import "../../styles/AdminTheme.css";
import "../../components/layout/AdminLayout.css";
import "./AdminPayments.css";

const API_BASE_URL = config.apiUrl;

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    totalRevenue: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/payments/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      
      // Debug: log first payment to check discount info
      if (data.payments && data.payments.length > 0) {
        console.log('Sample payment with discount info:', data.payments[0]);
      }
      
      // Calculate stats
      const allPayments = data.payments || [];
      const pendingCount = allPayments.filter(p => p.status === 'pending').length;
      const verifiedCount = allPayments.filter(p => p.status === 'verified').length;
      const rejectedCount = allPayments.filter(p => p.status === 'rejected').length;
      const totalRevenue = allPayments
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalPayments: allPayments.length,
        pendingCount,
        verifiedCount,
        rejectedCount,
        totalRevenue
      });
      
      // Filter payments
      let filtered = allPayments;
      if (filter !== "all") {
        filtered = allPayments.filter(p => p.status === filter);
      }

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(p => 
          p.paymentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Pagination
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedPayments = filtered.slice(startIndex, startIndex + itemsPerPage);
      
      setPayments(paginatedPayments);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerifyPayment = async (paymentId, status) => {
    // Build confirm message with discount details
    const payment = payments.find(p => p._id === paymentId);
    let confirmMsg = `Xác nhận ${status === "verified" ? "DUYỆT" : "TỪ CHỐI"} thanh toán này?`;
    if (payment && status === "verified") {
      confirmMsg = `Xác nhận DUYỆT thanh toán?\n\n• Gói: ${payment.planName}\n• Số tiền: ${formatAmount(payment.amount)}₫`;
      if (payment.discountCode) {
        confirmMsg += `\n• Mã discount: ${payment.discountCode}`;
        if (payment.discountInfo?.description) {
          confirmMsg += ` - ${payment.discountInfo.description}`;
        }
        if (payment.discountInfo?.type === 'price_reduction' && payment.originalAmount) {
          confirmMsg += `\n• Giá gốc: ${formatAmount(payment.originalAmount)}₫ → Đã giảm: ${formatAmount(payment.originalAmount - payment.amount)}₫`;
        }
        if (payment.discountInfo?.type === 'time_extension' && payment.discountInfo?.extraDays) {
          confirmMsg += `\n• Bonus: +${payment.discountInfo.extraDays} ngày Premium miễn phí`;
        }
      }
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setProcessing(paymentId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/payments/admin/verify/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify payment");
      }

      alert(status === "verified" ? "✅ Đã duyệt thanh toán!" : "❌ Đã từ chối thanh toán!");
      fetchPayments();
    } catch (error) {
      alert("Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Chờ xử lý", class: "status-badge warning" },
      verified: { text: "Đã duyệt", class: "status-badge success" },
      rejected: { text: "Từ chối", class: "status-badge danger" },
      expired: { text: "Hết hạn", class: "status-badge secondary" },
    };
    const badge = badges[status] || badges.pending;
    return <span className={badge.class}>{badge.text}</span>;
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>💳 Quản lý thanh toán</h1>
          <p>Xem và xử lý các giao dịch thanh toán</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.totalPayments}</h3>
              <p>Tổng giao dịch</p>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingCount}</h3>
              <p>Chờ xử lý</p>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.verifiedCount}</h3>
              <p>Đã duyệt</p>
            </div>
          </div>
          <div className="admin-stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{stats.rejectedCount}</h3>
              <p>Từ chối</p>
            </div>
          </div>
          <div className="admin-stat-card primary">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{formatAmount(stats.totalRevenue)}₫</h3>
              <p>Tổng doanh thu</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card">
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm theo mã, tên, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="verified">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchPayments}>
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="admin-card">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="admin-empty">
              <p>📭 Không có thanh toán nào</p>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã thanh toán</th>
                      <th>Người dùng</th>
                      <th>Gói</th>
                      <th>Số tiền</th>
                      <th>Discount</th>
                      <th>Ngày tạo</th>
                      <th>Ngày submit</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <code className="payment-code">{payment.paymentCode}</code>
                        </td>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">{payment.userName}</span>
                            <span className="user-email">{payment.userEmail}</span>
                          </div>
                        </td>
                        <td>
                          <span className="plan-badge">{payment.planName}</span>
                        </td>
                        <td>
                          <div className="amount-detail-cell">
                            <span className="amount-cell">
                              {formatAmount(payment.amount)}₫
                            </span>
                            {payment.discountCode && payment.originalAmount && payment.originalAmount !== payment.amount && (
                              <span className="amount-original">
                                <s>{formatAmount(payment.originalAmount)}₫</s>
                                <span className="amount-saved">-{formatAmount(payment.originalAmount - payment.amount)}₫</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {payment.discountCode ? (
                            <div className="discount-detail-cell">
                              <code className="discount-code-badge">{payment.discountCode}</code>
                              {payment.discountInfo?.description && (
                                <span className="discount-description" title={payment.discountInfo.description}>
                                  {payment.discountInfo.description}
                                </span>
                              )}
                              {payment.discountInfo?.type === 'price_reduction' && (
                                <span className="discount-tag price">
                                  💰 {payment.discountInfo.discountMethod === 'percentage'
                                    ? `${payment.discountInfo.discountValue}%`
                                    : `${formatAmount(payment.discountInfo.discountValue)}₫`}
                                </span>
                              )}
                              {payment.discountInfo?.type === 'time_extension' && (
                                <span className="discount-tag time">
                                  🎁 +{payment.discountInfo.extraDays} ngày
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>{payment.submittedAt ? (
                          <span style={{color: '#10b981', fontWeight: 600}}>
                            {formatDate(payment.submittedAt)}
                          </span>
                        ) : (
                          <span style={{color: '#f59e0b', fontSize: '12px', fontStyle: 'italic'}}>Chờ user xác nhận</span>
                        )}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>
                          <div className="action-buttons">
                            {payment.status === "pending" ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleVerifyPayment(payment._id, "verified")}
                                  disabled={processing === payment._id}
                                  title="Duyệt thanh toán và kích hoạt Premium"
                                >
                                  {processing === payment._id ? "⏳" : "✓ Duyệt"}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleVerifyPayment(payment._id, "rejected")}
                                  disabled={processing === payment._id}
                                  title="Từ chối yêu cầu thanh toán"
                                >
                                  {processing === payment._id ? "⏳" : "✗ Từ chối"}
                                </button>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="btn btn-outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Trước
                  </button>
                  <span className="page-info">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
