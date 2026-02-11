// User Roles
const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
  VENDOR: 'Vendor'
};

// Membership Duration
const MEMBERSHIP_DURATION = {
  '6_months': { label: '6 Months', months: 6 },
  '1_year': { label: '1 Year', months: 12 },
  '2_years': { label: '2 Years', months: 24 }
};

// Membership Status
const MEMBERSHIP_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
};

// Vendor Categories
const VENDOR_CATEGORIES = [
  'Catering',
  'Florist',
  'Decoration',
  'Lighting'
];

// Order Status
const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled'
};

// Membership Update Actions
const MEMBERSHIP_ACTIONS = {
  CREATED: 'Created',
  EXTENDED: 'Extended',
  CANCELLED: 'Cancelled'
};

module.exports = {
  ROLES,
  MEMBERSHIP_DURATION,
  MEMBERSHIP_STATUS,
  VENDOR_CATEGORIES,
  ORDER_STATUS,
  MEMBERSHIP_ACTIONS
};
