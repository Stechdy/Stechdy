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
    if (!window.confirm(`Xác nhận ${status === "verified" ? "DUYỆT" : "TỪ CHỐI"} thanh toán này?`)) {
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
                        <td className="amount-cell">
                          {formatAmount(payment.amount)}₫
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>{payment.submittedAt ? formatDate(payment.submittedAt) : "-"}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>
                          <div className="action-buttons">
                            {payment.status === "pending" && payment.submittedAt ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleVerifyPayment(payment._id, "verified")}
                                  disabled={processing === payment._id}
                                >
                                  ✓ Duyệt
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleVerifyPayment(payment._id, "rejected")}
                                  disabled={processing === payment._id}
                                >
                                  ✗ Từ chối
                                </button>
                              </>
                            ) : payment.status === "pending" && !payment.submittedAt ? (
                              <span className="text-muted">Chờ user xác nhận</span>
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
