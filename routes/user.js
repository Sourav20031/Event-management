const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// User Dashboard
router.get('/dashboard', isAuthenticated, requireRole([ROLES.USER]), userController.dashboard);

// Vendors
router.get('/vendors', isAuthenticated, requireRole([ROLES.USER]), userController.vendorsPage);
router.get('/vendor/:vendorId/products', isAuthenticated, requireRole([ROLES.USER]), userController.vendorProductsPage);

// Cart
router.post('/cart/add', isAuthenticated, requireRole([ROLES.USER]), userController.addToCart);
router.get('/cart', isAuthenticated, requireRole([ROLES.USER]), userController.cartPage);
router.post('/cart/update', isAuthenticated, requireRole([ROLES.USER]), userController.updateCartQuantity);
router.post('/cart/delete', isAuthenticated, requireRole([ROLES.USER]), userController.deleteCartItem);

// Checkout & Orders
router.get('/checkout/:vendorId', isAuthenticated, requireRole([ROLES.USER]), userController.checkoutPage);
router.post('/place-order', isAuthenticated, requireRole([ROLES.USER]), userController.placeOrder);
router.get('/order-status', isAuthenticated, requireRole([ROLES.USER]), userController.orderStatusPage);

// Guest List
router.get('/guest-list', isAuthenticated, requireRole([ROLES.USER]), userController.guestListPage);
router.post('/guest-list/create', isAuthenticated, requireRole([ROLES.USER]), userController.createGuestList);

module.exports = router;
