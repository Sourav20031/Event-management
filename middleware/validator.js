// Validation helper functions

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateUserId = (userId) => {
  // Alphanumeric, 4-20 chars
  const userIdRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return userIdRegex.test(userId);
};

const validateMembershipNo = (membershipNo) => {
  // Format: MEM-YYYYMMDD-###
  const membershipRegex = /^MEM-\d{8}-\d{3}$/;
  return membershipRegex.test(membershipNo);
};

const validateNonEmpty = (value) => {
  return value && value.trim().length > 0;
};

const validateNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUserId,
  validateMembershipNo,
  validateNonEmpty,
  validateNumber
};
