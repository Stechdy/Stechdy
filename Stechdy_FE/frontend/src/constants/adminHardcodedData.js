export const ADMIN_HARDCODED_METRICS = {
  totalUsers: 203,
  premiumUsers: 152,
  totalRevenue: 18048000,
  totalStudyHours: 904.5,
  newUsersThisMonth: 130,
  activeUsers: 185,
};

const MONTHLY_REVENUE_BREAKDOWN = [
  { _id: { month: 2 }, count: 3, revenue: 324000 },
  { _id: { month: 3 }, count: 149, revenue: 17724000 },
];

const WEEKLY_REVENUE_BREAKDOWN = [
  { _id: { week: 1 }, count: 3, revenue: 324000 },
  { _id: { week: 2 }, count: 28, revenue: 3348000 },
  { _id: { week: 3 }, count: 36, revenue: 4284000 },
  { _id: { week: 4 }, count: 41, revenue: 4896000 },
  { _id: { week: 5 }, count: 44, revenue: 5196000 },
];

const DAILY_REVENUE_BREAKDOWN = [
  { _id: { day: 12, month: 2 }, count: 1, revenue: 108000 },
  { _id: { day: 20, month: 2 }, count: 1, revenue: 108000 },
  { _id: { day: 27, month: 2 }, count: 1, revenue: 108000 },
  { _id: { day: 5, month: 3 }, count: 19, revenue: 2250000 },
  { _id: { day: 10, month: 3 }, count: 22, revenue: 2610000 },
  { _id: { day: 15, month: 3 }, count: 27, revenue: 3210000 },
  { _id: { day: 21, month: 3 }, count: 31, revenue: 3690000 },
  { _id: { day: 26, month: 3 }, count: 24, revenue: 2850000 },
  { _id: { day: 31, month: 3 }, count: 26, revenue: 3114000 },
];

const REVENUE_BY_PLAN = [
  { _id: 'premium-monthly', planName: 'Premium tháng', count: 89, revenue: 10680000 },
  { _id: 'premium-quarterly', planName: 'Premium quý', count: 41, revenue: 4920000 },
  { _id: 'premium-yearly', planName: 'Premium năm', count: 25, revenue: 2448000 },
];

const MONTHLY_REPORT_DATA = {
  2: {
    users: {
      newUsers: 18,
      previousNewUsers: 14,
      growthRate: 28.6,
      premiumConversions: 3,
    },
    revenue: {
      total: 324000,
      previous: 216000,
      growthRate: 50.0,
      transactions: 3,
      byPlan: [
        { _id: 'premium-monthly', planName: 'Premium tháng', count: 2, revenue: 240000 },
        { _id: 'premium-quarterly', planName: 'Premium quý', count: 1, revenue: 84000 },
      ],
    },
    studySessions: {
      total: 68,
      completed: 61,
      completionRate: 89.7,
      totalHours: 214.5,
    },
    activeUsers: 62,
  },
  3: {
    users: {
      newUsers: ADMIN_HARDCODED_METRICS.newUsersThisMonth,
      previousNewUsers: 18,
      growthRate: 622.2,
      premiumConversions: 121,
    },
    revenue: {
      total: 17724000,
      previous: 324000,
      growthRate: 5370.4,
      transactions: 149,
      byPlan: [
        { _id: 'premium-monthly', planName: 'Premium tháng', count: 87, revenue: 10440000 },
        { _id: 'premium-quarterly', planName: 'Premium quý', count: 40, revenue: 4200000 },
        { _id: 'premium-yearly', planName: 'Premium năm', count: 25, revenue: 3084000 },
      ],
    },
    studySessions: {
      total: 194,
      completed: 194,
      completionRate: 100,
      totalHours: ADMIN_HARDCODED_METRICS.totalStudyHours,
    },
    activeUsers: ADMIN_HARDCODED_METRICS.activeUsers,
  },
};

const TOP_USERS = [
  {
    user: { name: 'Nguyen Minh Anh', email: 'minhanh@stechdy.vn', avatarUrl: '' },
    totalMinutes: 6420,
    sessionsCompleted: 34,
  },
  {
    user: { name: 'Tran Bao Chau', email: 'baochau@stechdy.vn', avatarUrl: '' },
    totalMinutes: 5950,
    sessionsCompleted: 30,
  },
  {
    user: { name: 'Le Quoc Dat', email: 'quocdat@stechdy.vn', avatarUrl: '' },
    totalMinutes: 5620,
    sessionsCompleted: 29,
  },
];

const RECENT_USERS = [
  {
    _id: 'u-202603-001',
    name: 'Pham Thanh Huyen',
    email: 'thanhhuyen@stechdy.vn',
    premiumStatus: 'premium',
    createdAt: '2026-03-22T08:30:00.000Z',
    avatarUrl: '',
  },
  {
    _id: 'u-202603-002',
    name: 'Do Minh Khoa',
    email: 'minhkhoa@stechdy.vn',
    premiumStatus: 'free',
    createdAt: '2026-03-21T14:10:00.000Z',
    avatarUrl: '',
  },
  {
    _id: 'u-202603-003',
    name: 'Hoang Gia Linh',
    email: 'gialinh@stechdy.vn',
    premiumStatus: 'premium',
    createdAt: '2026-03-20T09:45:00.000Z',
    avatarUrl: '',
  },
  {
    _id: 'u-202603-004',
    name: 'Nguyen Duy An',
    email: 'duyan@stechdy.vn',
    premiumStatus: 'free',
    createdAt: '2026-03-19T16:20:00.000Z',
    avatarUrl: '',
  },
  {
    _id: 'u-202603-005',
    name: 'Le Thu Trang',
    email: 'thutrang@stechdy.vn',
    premiumStatus: 'premium',
    createdAt: '2026-03-18T11:00:00.000Z',
    avatarUrl: '',
  },
];

const RECENT_PAYMENTS = [
  {
    _id: 'pay-202603-149',
    userName: 'Pham Thanh Huyen',
    userEmail: 'thanhhuyen@stechdy.vn',
    planName: 'Premium tháng',
    amount: 120000,
    status: 'verified',
  },
  {
    _id: 'pay-202603-148',
    userName: 'Hoang Gia Linh',
    userEmail: 'gialinh@stechdy.vn',
    planName: 'Premium quý',
    amount: 420000,
    status: 'pending',
  },
  {
    _id: 'pay-202603-147',
    userName: 'Tran Bao Chau',
    userEmail: 'baochau@stechdy.vn',
    planName: 'Premium năm',
    amount: 1400000,
    status: 'verified',
  },
  {
    _id: 'pay-202602-003',
    userName: 'Le Quoc Dat',
    userEmail: 'quocdat@stechdy.vn',
    planName: 'Premium tháng',
    amount: 120000,
    status: 'verified',
  },
  {
    _id: 'pay-202602-002',
    userName: 'Nguyen Duy An',
    userEmail: 'duyan@stechdy.vn',
    planName: 'Premium tháng',
    amount: 120000,
    status: 'rejected',
  },
];

const MONTH_NAMES = [
  '',
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const getRevenueByPeriod = (period) => {
  if (period === 'daily') return DAILY_REVENUE_BREAKDOWN;
  if (period === 'weekly') return WEEKLY_REVENUE_BREAKDOWN;
  return MONTHLY_REVENUE_BREAKDOWN;
};

export const getHardcodedDashboardStats = () => ({
  users: {
    total: ADMIN_HARDCODED_METRICS.totalUsers,
    premium: ADMIN_HARDCODED_METRICS.premiumUsers,
    growthRate: 0,
    newThisMonth: ADMIN_HARDCODED_METRICS.newUsersThisMonth,
    newLastMonth: 103,
    active: ADMIN_HARDCODED_METRICS.activeUsers,
  },
  revenue: {
    thisMonth: ADMIN_HARDCODED_METRICS.totalRevenue,
    growthRate: 0,
    pendingPayments: 4,
  },
  studySessions: {
    total: 194,
    completionRate: 100,
    totalStudyHours: ADMIN_HARDCODED_METRICS.totalStudyHours,
    completed: 194,
  },
  recentUsers: RECENT_USERS,
  recentPayments: RECENT_PAYMENTS,
});

export const getHardcodedRevenueStats = (period, year) => {
  const totalTransactions = REVENUE_BY_PLAN.reduce((sum, item) => sum + item.count, 0);

  return {
    summary: {
      totalRevenue: ADMIN_HARDCODED_METRICS.totalRevenue,
      totalTransactions,
      avgTransaction: ADMIN_HARDCODED_METRICS.totalRevenue / totalTransactions,
    },
    revenueByPeriod: getRevenueByPeriod(period),
    revenueByPlan: REVENUE_BY_PLAN,
    period,
    year,
  };
};

export const getHardcodedMonthlyReport = (month, year) => {
  const selectedMonthReport = MONTHLY_REPORT_DATA[month] || {
    users: {
      newUsers: 0,
      previousNewUsers: 0,
      growthRate: 0,
      premiumConversions: 0,
    },
    revenue: {
      total: 0,
      previous: 0,
      growthRate: 0,
      transactions: 0,
      byPlan: [],
    },
    studySessions: {
      total: 0,
      completed: 0,
      completionRate: 0,
      totalHours: 0,
    },
    activeUsers: 0,
  };

  return {
    period: {
      month,
      year,
      monthName: MONTH_NAMES[month] || `Tháng ${month}`,
    },
    users: selectedMonthReport.users,
    revenue: selectedMonthReport.revenue,
    studySessions: selectedMonthReport.studySessions,
    activeUsers: selectedMonthReport.activeUsers,
    topUsers: TOP_USERS,
  };
};
