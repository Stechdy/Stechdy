const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Discount code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  // 'price_reduction' = giảm tiền, 'time_extension' = thêm thời gian premium
  type: {
    type: String,
    enum: ['price_reduction', 'time_extension'],
    required: [true, 'Discount type is required']
  },
  // Áp dụng cho gói nào: 'all' hoặc cụ thể 'oneMonth', 'threeMonths', 'oneYear'
  applicablePlans: {
    type: [String],
    enum: ['all', 'oneMonth', 'threeMonths', 'oneYear'],
    default: ['all']
  },
  // === Cho type 'price_reduction' ===
  // Kiểu giảm giá: 'percentage' hoặc 'fixed'
  discountMethod: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  // Giá trị giảm: nếu percentage thì 10 = 10%, nếu fixed thì 10000 = giảm 10.000đ
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  // Giảm tối đa (chỉ dùng cho percentage)
  maxDiscountAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // === Cho type 'time_extension' ===
  // Số ngày thêm vào thời gian premium
  extraDays: {
    type: Number,
    default: 0,
    min: 0
  },

  // Thời gian áp dụng
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },

  // Giới hạn sử dụng
  maxUsage: {
    type: Number,
    default: 0, // 0 = không giới hạn
    min: 0
  },
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  },

  // Giới hạn mỗi user chỉ dùng 1 lần
  onePerUser: {
    type: Boolean,
    default: true
  },

  // Danh sách user đã sử dụng
  usedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }],

  // Trạng thái
  isActive: {
    type: Boolean,
    default: true
  },

  // Admin tạo
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
discountSchema.index({ code: 1, isActive: 1 });

// Kiểm tra discount còn hiệu lực
discountSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startDate || now > this.endDate) return false;
  if (this.maxUsage > 0 && this.currentUsage >= this.maxUsage) return false;
  return true;
};

// Kiểm tra user đã dùng chưa
discountSchema.methods.hasUserUsed = function(userId) {
  return this.usedBy.some(u => u.userId.toString() === userId.toString());
};

// Tính giá sau khi áp dụng discount (cho type price_reduction)
discountSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  if (this.type !== 'price_reduction') return originalPrice;

  let discountAmount = 0;
  if (this.discountMethod === 'percentage') {
    discountAmount = (originalPrice * this.discountValue) / 100;
    if (this.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else {
    discountAmount = this.discountValue;
  }

  return Math.max(0, originalPrice - discountAmount);
};

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;
