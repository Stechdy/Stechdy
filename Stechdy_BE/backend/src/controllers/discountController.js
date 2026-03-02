const Discount = require('../models/Discount');

// Middleware to check admin role
const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'moderator');
};

// =====================
// ADMIN: CRUD Discount
// =====================

// Tạo mã discount mới
exports.createDiscount = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const {
      code, description, type, applicablePlans,
      discountMethod, discountValue, maxDiscountAmount,
      extraDays, startDate, endDate, maxUsage, onePerUser, isActive
    } = req.body;

    // Kiểm tra code trùng
    const existing = await Discount.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã discount đã tồn tại.' });
    }

    // Validate theo type
    if (type === 'price_reduction' && (!discountValue || discountValue <= 0)) {
      return res.status(400).json({ message: 'Giá trị giảm giá phải lớn hơn 0.' });
    }
    if (type === 'time_extension' && (!extraDays || extraDays <= 0)) {
      return res.status(400).json({ message: 'Số ngày thêm phải lớn hơn 0.' });
    }

    const discount = new Discount({
      code: code.toUpperCase(),
      description,
      type,
      applicablePlans: applicablePlans || ['all'],
      discountMethod: discountMethod || 'percentage',
      discountValue: discountValue || 0,
      maxDiscountAmount: maxDiscountAmount || 0,
      extraDays: extraDays || 0,
      startDate,
      endDate,
      maxUsage: maxUsage || 0,
      onePerUser: onePerUser !== undefined ? onePerUser : true,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Tạo mã discount thành công!',
      data: discount
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi tạo discount.' });
  }
};

// Lấy danh sách tất cả discount (admin)
exports.getAllDiscounts = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.$or = [
        { isActive: false },
        { endDate: { $lt: new Date() } }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Discount.countDocuments(query);
    const discounts = await Discount.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: discounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách discount.' });
  }
};

// Lấy chi tiết 1 discount (admin)
exports.getDiscountById = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('usedBy.userId', 'name email');

    if (!discount) {
      return res.status(404).json({ message: 'Không tìm thấy discount.' });
    }

    res.json({ success: true, data: discount });
  } catch (error) {
    console.error('Get discount error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết discount.' });
  }
};

// Cập nhật discount (admin)
exports.updateDiscount = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Không tìm thấy discount.' });
    }

    const {
      description, type, applicablePlans,
      discountMethod, discountValue, maxDiscountAmount,
      extraDays, startDate, endDate, maxUsage, onePerUser, isActive
    } = req.body;

    // Cập nhật fields
    if (description !== undefined) discount.description = description;
    if (type !== undefined) discount.type = type;
    if (applicablePlans !== undefined) discount.applicablePlans = applicablePlans;
    if (discountMethod !== undefined) discount.discountMethod = discountMethod;
    if (discountValue !== undefined) discount.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) discount.maxDiscountAmount = maxDiscountAmount;
    if (extraDays !== undefined) discount.extraDays = extraDays;
    if (startDate !== undefined) discount.startDate = startDate;
    if (endDate !== undefined) discount.endDate = endDate;
    if (maxUsage !== undefined) discount.maxUsage = maxUsage;
    if (onePerUser !== undefined) discount.onePerUser = onePerUser;
    if (isActive !== undefined) discount.isActive = isActive;

    await discount.save();

    res.json({
      success: true,
      message: 'Cập nhật discount thành công!',
      data: discount
    });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật discount.' });
  }
};

// Xóa discount (admin)
exports.deleteDiscount = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Không tìm thấy discount.' });
    }

    res.json({
      success: true,
      message: 'Xóa discount thành công!'
    });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa discount.' });
  }
};

// Toggle active/inactive (admin)
exports.toggleDiscountStatus = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Không tìm thấy discount.' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.json({
      success: true,
      message: `Discount đã ${discount.isActive ? 'kích hoạt' : 'vô hiệu hóa'}!`,
      data: discount
    });
  } catch (error) {
    console.error('Toggle discount error:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái discount.' });
  }
};

// =====================
// PUBLIC: Validate & Apply Discount
// =====================

// Validate mã discount (user nhập trên trang pricing)
exports.validateDiscount = async (req, res) => {
  try {
    const { code, planId } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã discount.' });
    }

    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    if (!discount) {
      return res.status(404).json({ message: 'Mã discount không tồn tại hoặc đã hết hiệu lực.' });
    }

    // Kiểm tra thời gian
    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      return res.status(400).json({ message: 'Mã discount đã hết hạn hoặc chưa đến thời gian áp dụng.' });
    }

    // Kiểm tra lượt sử dụng
    if (discount.maxUsage > 0 && discount.currentUsage >= discount.maxUsage) {
      return res.status(400).json({ message: 'Mã discount đã hết lượt sử dụng.' });
    }

    // Kiểm tra user đã dùng chưa
    if (discount.onePerUser && discount.hasUserUsed(userId)) {
      return res.status(400).json({ message: 'Bạn đã sử dụng mã discount này rồi.' });
    }

    // Kiểm tra gói áp dụng
    if (planId && !discount.applicablePlans.includes('all') && !discount.applicablePlans.includes(planId)) {
      return res.status(400).json({ message: 'Mã discount không áp dụng cho gói này.' });
    }

    // Trả về thông tin discount
    const responseData = {
      code: discount.code,
      description: discount.description,
      type: discount.type,
      applicablePlans: discount.applicablePlans
    };

    if (discount.type === 'price_reduction') {
      responseData.discountMethod = discount.discountMethod;
      responseData.discountValue = discount.discountValue;
      responseData.maxDiscountAmount = discount.maxDiscountAmount;
    } else {
      responseData.extraDays = discount.extraDays;
    }

    res.json({
      success: true,
      message: 'Mã discount hợp lệ!',
      data: responseData
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra mã discount.' });
  }
};

// Apply discount (gọi khi tạo payment)
exports.applyDiscount = async (req, res) => {
  try {
    const { code, planId, originalPrice } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã discount.' });
    }

    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    if (!discount || !discount.isValid()) {
      return res.status(400).json({ message: 'Mã discount không hợp lệ.' });
    }

    // Kiểm tra user đã dùng chưa
    if (discount.onePerUser && discount.hasUserUsed(userId)) {
      return res.status(400).json({ message: 'Bạn đã sử dụng mã discount này rồi.' });
    }

    // Kiểm tra gói áp dụng
    if (planId && !discount.applicablePlans.includes('all') && !discount.applicablePlans.includes(planId)) {
      return res.status(400).json({ message: 'Mã discount không áp dụng cho gói này.' });
    }

    let result = {};

    if (discount.type === 'price_reduction') {
      const discountedPrice = discount.calculateDiscountedPrice(originalPrice);
      result = {
        type: 'price_reduction',
        originalPrice,
        discountedPrice,
        savedAmount: originalPrice - discountedPrice,
        discountMethod: discount.discountMethod,
        discountValue: discount.discountValue
      };
    } else {
      result = {
        type: 'time_extension',
        originalPrice,
        discountedPrice: originalPrice,
        extraDays: discount.extraDays,
        savedAmount: 0
      };
    }

    // Cập nhật usage
    discount.currentUsage += 1;
    discount.usedBy.push({ userId, usedAt: new Date() });
    await discount.save();

    res.json({
      success: true,
      message: 'Áp dụng mã discount thành công!',
      data: {
        discountCode: discount.code,
        discountDescription: discount.description,
        ...result
      }
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({ message: 'Lỗi khi áp dụng discount.' });
  }
};
