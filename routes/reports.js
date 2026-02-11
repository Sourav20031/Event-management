const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Admin Reports
router.get('/admin', isAuthenticated, requireRole([ROLES.ADMIN]), async (req, res) => {
  try {
    // Membership report
    const [membershipStats] = await db.execute(
      `SELECT status, COUNT(*) as count FROM vendor_memberships GROUP BY status`
    );
    
    // Vendor report
    const [vendorStats] = await db.execute(
      `SELECT status, COUNT(*) as count FROM vendors GROUP BY status`
    );
    
    // User report
    const [userStats] = await db.execute(
      `SELECT role, COUNT(*) as count FROM users WHERE active = TRUE GROUP BY role`
    );
    
    // Order report
    const [orderStats] = await db.execute(
      `SELECT order_status, COUNT(*) as count, SUM(total_amount) as total
       FROM orders GROUP BY order_status`
    );
    
    // Recent orders
    const [recentOrders] = await db.execute(
      `SELECT o.*, u.name as user_name, v.vendor_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN vendors v ON o.vendor_id = v.id
       ORDER BY o.created_at DESC LIMIT 10`
    );
    
    res.render('reports/admin', {
      name: req.session.name,
      membershipStats,
      vendorStats,
      userStats,
      orderStats,
      recentOrders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading admin reports',
      statusCode: 500
    });
  }
});

// Vendor Reports
router.get('/vendor', isAuthenticated, requireRole([ROLES.VENDOR]), async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    
    // Product statistics
    const [productStats] = await db.execute(
      `SELECT status, COUNT(*) as count FROM products WHERE vendor_id = ? GROUP BY status`,
      [vendorId]
    );
    
    // Order statistics
    const [orderStats] = await db.execute(
      `SELECT order_status, COUNT(*) as count, SUM(total_amount) as total
       FROM orders WHERE vendor_id = ? GROUP BY order_status`,
      [vendorId]
    );
    
    // Top products
    const [topProducts] = await db.execute(
      `SELECT p.id, p.product_name, COUNT(oi.id) as order_count, SUM(oi.total_price) as total_sales
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       WHERE p.vendor_id = ?
       GROUP BY p.id
       ORDER BY total_sales DESC LIMIT 5`,
      [vendorId]
    );
    
    // Recent transactions
    const [recentOrders] = await db.execute(
      `SELECT o.*, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.vendor_id = ?
       ORDER BY o.created_at DESC LIMIT 10`,
      [vendorId]
    );
    
    res.render('reports/vendor', {
      vendorName: req.session.vendorName,
      productStats,
      orderStats,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading vendor reports',
      statusCode: 500
    });
  }
});

// User Reports
router.get('/user', isAuthenticated, requireRole([ROLES.USER]), async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Order statistics
    const [orderStats] = await db.execute(
      `SELECT order_status, COUNT(*) as count, SUM(total_amount) as total
       FROM orders WHERE user_id = ? GROUP BY order_status`,
      [userId]
    );
    
    // Spending by vendor
    const [vendorSpending] = await db.execute(
      `SELECT v.vendor_name, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
       FROM orders o
       JOIN vendors v ON o.vendor_id = v.id
       WHERE o.user_id = ?
       GROUP BY o.vendor_id
       ORDER BY total_spent DESC`,
      [userId]
    );
    
    // Recent orders
    const [recentOrders] = await db.execute(
      `SELECT o.*, v.vendor_name
       FROM orders o
       LEFT JOIN vendors v ON o.vendor_id = v.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC LIMIT 10`,
      [userId]
    );
    
    res.render('reports/user', {
      name: req.session.name,
      orderStats,
      vendorSpending,
      recentOrders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading user reports',
      statusCode: 500
    });
  }
});

module.exports = router;
