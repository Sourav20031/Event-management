const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Vendor Dashboard
router.get('/dashboard', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.dashboard);

// Your Items
router.get('/your-items', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.yourItemsPage);

// Add Item
router.get('/add-item', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.addItemPage);
router.post('/add-item', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.addProduct);
router.get('/add-item-success', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.addItemSuccessPage);

// Delete Item
router.post('/delete-item', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.deleteProduct);

// Product Status
router.get('/product-status', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.productStatusPage);
router.post('/update-product-status', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.updateProductStatus);

// Transactions
router.get('/transactions', isAuthenticated, requireRole([ROLES.VENDOR]), vendorController.transactionsPage);

module.exports = router;
