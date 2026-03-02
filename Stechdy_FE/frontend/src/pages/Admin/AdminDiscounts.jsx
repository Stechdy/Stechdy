import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import config from "../../config";
import "../../styles/AdminTheme.css";
import "../../components/layout/AdminLayout.css";
import "./AdminDiscounts.css";

const API_BASE_URL = config.apiUrl;

const PLAN_LABELS = {
  all: "Tất cả gói",
  oneMonth: "1 Tháng",
  threeMonths: "3 Tháng",
  oneYear: "1 Năm",
};

const initialFormData = {
  code: "",
  description: "",
  type: "price_reduction",
  applicablePlans: ["all"],
  discountMethod: "percentage",
  discountValue: 0,
  maxDiscountAmount: 0,
  extraDays: 0,
  startDate: "",
  endDate: "",
  maxUsage: 0,
  onePerUser: true,
  isActive: true,
};

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalUsage: 0 });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [saving, setSaving] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({ page: currentPage, limit: 20 });
      if (filter === "active") params.append("status", "active");
      if (filter === "inactive") params.append("status", "inactive");
      if (typeFilter) params.append("type", typeFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`${API_BASE_URL}/discounts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch discounts");

      const data = await response.json();
      setDiscounts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);

      // Calculate stats from full list (separate call without filters)
      const allRes = await fetch(`${API_BASE_URL}/discounts?limit=10000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        const all = allData.data || [];
        const now = new Date();
        const active = all.filter(d => d.isActive && new Date(d.endDate) >= now);
        const totalUsage = all.reduce((sum, d) => sum + (d.currentUsage || 0), 0);
        setStats({
          total: all.length,
          active: active.length,
          inactive: all.length - active.length,
          totalUsage,
        });
      }
    } catch (error) {
      console.error("Fetch discounts error:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, searchTerm, currentPage]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getDiscountStatus = (discount) => {
    const now = new Date();
    if (!discount.isActive) return { text: "Vô hiệu", class: "discount-status-inactive" };
    if (new Date(discount.endDate) < now) return { text: "Hết hạn", class: "discount-status-expired" };
    if (new Date(discount.startDate) > now) return { text: "Chưa bắt đầu", class: "discount-status-expired" };
    return { text: "Đang hoạt động", class: "discount-status-active" };
  };

  const getUsagePercentage = (discount) => {
    if (!discount.maxUsage || discount.maxUsage === 0) return 0;
    return Math.min(100, (discount.currentUsage / discount.maxUsage) * 100);
  };

  const getUsageBarClass = (percentage) => {
    if (percentage < 50) return "low";
    if (percentage < 80) return "medium";
    return "high";
  };

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingId(null);
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setFormData({
      ...initialFormData,
      startDate: now.toISOString().slice(0, 16),
      endDate: nextMonth.toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const handleOpenEdit = (discount) => {
    setEditingId(discount._id);
    setFormData({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      applicablePlans: discount.applicablePlans || ["all"],
      discountMethod: discount.discountMethod || "percentage",
      discountValue: discount.discountValue || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
      extraDays: discount.extraDays || 0,
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : "",
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : "",
      maxUsage: discount.maxUsage || 0,
      onePerUser: discount.onePerUser !== undefined ? discount.onePerUser : true,
      isActive: discount.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const url = editingId
        ? `${API_BASE_URL}/discounts/${editingId}`
        : `${API_BASE_URL}/discounts`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Có lỗi xảy ra!");
        return;
      }

      alert(editingId ? "✅ Cập nhật thành công!" : "✅ Tạo mã discount thành công!");
      setShowModal(false);
      fetchDiscounts();
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/discounts/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to toggle");
      fetchDiscounts();
    } catch (error) {
      alert("Lỗi khi thay đổi trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mã discount này?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");
      alert("✅ Đã xóa discount!");
      fetchDiscounts();
    } catch (error) {
      alert("Lỗi khi xóa discount");
    }
  };

  const handlePlanToggle = (plan) => {
    setFormData((prev) => {
      let plans = [...prev.applicablePlans];
      if (plan === "all") {
        plans = plans.includes("all") ? [] : ["all"];
      } else {
        plans = plans.filter((p) => p !== "all");
        if (plans.includes(plan)) {
          plans = plans.filter((p) => p !== plan);
        } else {
          plans.push(plan);
        }
        if (plans.length === 0) plans = ["all"];
      }
      return { ...prev, applicablePlans: plans };
    });
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h1>🎫 Quản lý mã Discount</h1>
          <p>Tạo và quản lý mã giảm giá, khuyến mãi cho người dùng</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Tổng mã discount</p>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.active}</h3>
              <p>Đang hoạt động</p>
            </div>
          </div>
          <div className="admin-stat-card danger">
            <div className="stat-icon">⛔</div>
            <div className="stat-info">
              <h3>{stats.inactive}</h3>
              <p>Không hoạt động</p>
            </div>
          </div>
          <div className="admin-stat-card primary">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.totalUsage}</h3>
              <p>Tổng lượt sử dụng</p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="admin-card">
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm theo mã hoặc mô tả..."
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
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Kiểu:</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả</option>
                <option value="price_reduction">Giảm giá</option>
                <option value="time_extension">Thêm thời gian</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              ➕ Tạo mới
            </button>
            <button className="btn btn-primary" onClick={fetchDiscounts}>
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="admin-card">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="admin-empty">
              <p>🎫 Chưa có mã discount nào</p>
              <button className="btn btn-primary" onClick={handleOpenCreate} style={{ marginTop: 16 }}>
                ➕ Tạo mã discount đầu tiên
              </button>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Mô tả</th>
                      <th>Kiểu</th>
                      <th>Giá trị</th>
                      <th>Gói áp dụng</th>
                      <th>Thời gian</th>
                      <th>Sử dụng</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount) => {
                      const status = getDiscountStatus(discount);
                      const usagePct = getUsagePercentage(discount);
                      const usageBarClass = getUsageBarClass(usagePct);

                      return (
                        <tr key={discount._id}>
                          <td>
                            <code className="discount-code">{discount.code}</code>
                          </td>
                          <td>
                            <div className="discount-description-cell" title={discount.description}>
                              {discount.description}
                            </div>
                          </td>
                          <td>
                            <span className={`discount-type-badge ${discount.type === "price_reduction" ? "price" : "time"}`}>
                              {discount.type === "price_reduction" ? "💰 Giảm giá" : "⏰ Thêm ngày"}
                            </span>
                          </td>
                          <td>
                            <span className="discount-value">
                              {discount.type === "price_reduction"
                                ? discount.discountMethod === "percentage"
                                  ? `${discount.discountValue}%`
                                  : `${formatAmount(discount.discountValue)}₫`
                                : `+${discount.extraDays} ngày`}
                            </span>
                          </td>
                          <td>
                            <div className="discount-plans">
                              {(discount.applicablePlans || []).map((plan) => (
                                <span key={plan} className="discount-plan-tag">
                                  {PLAN_LABELS[plan] || plan}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="date-cell">
                              <span className="date-label">Từ:</span>
                              <span className="date-start">{formatDate(discount.startDate)}</span>
                              <span className="date-label">Đến:</span>
                              <span className="date-end">{formatDate(discount.endDate)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="discount-usage">
                              <span className="usage-text">
                                {discount.currentUsage}/{discount.maxUsage === 0 ? "∞" : discount.maxUsage}
                              </span>
                              {discount.maxUsage > 0 && (
                                <div className="usage-bar">
                                  <div
                                    className={`usage-bar-fill ${usageBarClass}`}
                                    style={{ width: `${usagePct}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={status.class}>{status.text}</span>
                          </td>
                          <td>
                            <div className="discount-actions">
                              <button
                                className="discount-action-btn edit"
                                onClick={() => handleOpenEdit(discount)}
                                title="Chỉnh sửa"
                              >
                                ✏️
                              </button>
                              <button
                                className="discount-action-btn toggle"
                                onClick={() => handleToggleStatus(discount._id)}
                                title={discount.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                              >
                                {discount.isActive ? "⏸" : "▶"}
                              </button>
                              <button
                                className="discount-action-btn delete"
                                onClick={() => handleDelete(discount._id)}
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="btn btn-outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Trước
                  </button>
                  <span className="page-info">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="discount-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discount-modal-header">
              <h2>{editingId ? "✏️ Chỉnh sửa Discount" : "➕ Tạo Discount mới"}</h2>
              <button className="discount-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="discount-modal-body">
              {/* Code */}
              <div className="discount-form-group">
                <label>Mã Discount</label>
                <input
                  type="text"
                  placeholder="VD: SUMMER2026, NEWYEAR50..."
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  disabled={!!editingId}
                  style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
                />
              </div>

              {/* Description */}
              <div className="discount-form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả chương trình khuyến mãi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Type Selector */}
              <div className="discount-form-group">
                <label>Kiểu Discount</label>
                <div className="discount-type-selector">
                  <div
                    className={`discount-type-option ${formData.type === "price_reduction" ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, type: "price_reduction" })}
                  >
                    <div className="type-icon">💰</div>
                    <div className="type-label">Giảm giá</div>
                    <div className="type-desc">Giảm tiền cho gói đăng ký</div>
                  </div>
                  <div
                    className={`discount-type-option ${formData.type === "time_extension" ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, type: "time_extension" })}
                  >
                    <div className="type-icon">⏰</div>
                    <div className="type-label">Thêm thời gian</div>
                    <div className="type-desc">Giữ nguyên giá, thêm ngày dùng Premium</div>
                  </div>
                </div>
              </div>

              {/* Price Reduction Fields */}
              {formData.type === "price_reduction" && (
                <>
                  <div className="discount-form-row">
                    <div className="discount-form-group">
                      <label>Phương thức giảm</label>
                      <select
                        value={formData.discountMethod}
                        onChange={(e) => setFormData({ ...formData, discountMethod: e.target.value })}
                      >
                        <option value="percentage">Theo phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (VND)</option>
                      </select>
                    </div>
                    <div className="discount-form-group">
                      <label>
                        Giá trị giảm {formData.discountMethod === "percentage" ? "(%)" : "(VND)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.discountMethod === "percentage" ? 100 : undefined}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  {formData.discountMethod === "percentage" && (
                    <div className="discount-form-group">
                      <label>Giảm tối đa (VND) - 0 = không giới hạn</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Time Extension Fields */}
              {formData.type === "time_extension" && (
                <div className="discount-form-group">
                  <label>Số ngày thêm vào Premium</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="VD: 7, 14, 30..."
                    value={formData.extraDays}
                    onChange={(e) => setFormData({ ...formData, extraDays: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* Applicable Plans */}
              <div className="discount-form-group">
                <label>Áp dụng cho gói</label>
                <div className="discount-plans-selector">
                  {Object.entries(PLAN_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      className={`plan-checkbox ${formData.applicablePlans.includes(key) ? "checked" : ""}`}
                      onClick={() => handlePlanToggle(key)}
                    >
                      <span>{formData.applicablePlans.includes(key) ? "☑" : "☐"}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="discount-form-row">
                <div className="discount-form-group">
                  <label>Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="discount-form-group">
                  <label>Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div className="discount-form-row">
                <div className="discount-form-group">
                  <label>Giới hạn sử dụng (0 = không giới hạn)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
                  />
                </div>
                <div className="discount-form-group">
                  <label>Mỗi user chỉ dùng 1 lần</label>
                  <div style={{ paddingTop: 6 }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.onePerUser}
                        onChange={(e) => setFormData({ ...formData, onePerUser: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="discount-form-group">
                <label>Trạng thái</label>
                <div style={{ paddingTop: 6, display: "flex", alignItems: "center", gap: 10 }}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: 13, color: formData.isActive ? "var(--admin-success)" : "var(--admin-danger)", fontWeight: 600 }}>
                    {formData.isActive ? "Kích hoạt" : "Vô hiệu hóa"}
                  </span>
                </div>
              </div>
            </div>

            <div className="discount-modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSave} disabled={saving || !formData.code || !formData.description}>
                {saving ? "Đang lưu..." : editingId ? "💾 Cập nhật" : "✅ Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDiscounts;
