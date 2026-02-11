const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const adminController = require('../controllers/adminController');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Admin Dashboard
router.get('/dashboard', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.dashboard);

// Maintenance Menu
router.get('/maintenance-menu', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.maintenanceMenu);

// Membership Management
router.get('/add-membership', isAuthenticated, requireRole([ROLES.ADMIN]), membershipController.addMembershipPage);
router.post('/add-membership', isAuthenticated, requireRole([ROLES.ADMIN]), membershipController.addMembership);

router.get('/update-membership', isAuthenticated, requireRole([ROLES.ADMIN]), membershipController.updateMembershipPage);
router.post('/update-membership', isAuthenticated, requireRole([ROLES.ADMIN]), membershipController.updateMembership);

// User Management
router.get('/user-management', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.userManagementPage);
router.post('/toggle-user-status', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.toggleUserStatus);

// Vendor Management
router.get('/vendor-management', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.vendorManagementPage);
router.post('/toggle-vendor-status', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.toggleVendorStatus);

// API
router.get('/api/vendors', isAuthenticated, requireRole([ROLES.ADMIN]), adminController.getVendors);
router.get('/api/membership/:membershipNo', isAuthenticated, requireRole([ROLES.ADMIN]), membershipController.getMembership);

module.exports = router;
