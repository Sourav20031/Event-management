const db = require('../config/database');

// Admin Dashboard
exports.dashboard = async (req, res) => {
  try {
    // Get statistics
    const [userCount] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "User" AND active = TRUE'
    );
    const [vendorCount] = await db.execute(
      'SELECT COUNT(*) as count FROM vendors WHERE status = "Active"'
    );
    const [activeMemberships] = await db.execute(
      'SELECT COUNT(*) as count FROM vendor_memberships WHERE status = "Active"'
    );
    const [totalOrders] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE order_status = "Confirmed"'
    );
    
    res.render('admin/dashboard', {
      name: req.session.name,
      stats: {
        users: userCount[0].count,
        vendors: vendorCount[0].count,
        activeMemberships: activeMemberships[0].count,
        totalOrders: totalOrders[0].count
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading dashboard',
      statusCode: 500
    });
  }
};

// Maintenance Menu
exports.maintenanceMenu = (req, res) => {
  res.render('admin/maintenance-menu', { name: req.session.name });
};

// User Management
exports.userManagementPage = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, user_id, email, name, role, active, created_at FROM users WHERE role = "User" ORDER BY created_at DESC'
    );
    
    res.render('admin/user-management', { 
      users,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading user management',
      statusCode: 500
    });
  }
};

// Vendor Management
exports.vendorManagementPage = async (req, res) => {
  try {
    const [vendors] = await db.execute(
      `SELECT v.id, v.vendor_name, v.category, v.email, v.phone, v.status, v.created_at,
              vm.membership_no, vm.end_date, vm.status as membership_status
       FROM vendors v
       LEFT JOIN vendor_memberships vm ON v.id = vm.vendor_id AND vm.status = 'Active'
       ORDER BY v.created_at DESC`
    );
    
    res.render('admin/vendor-management', { 
      vendors,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading vendor management',
      statusCode: 500
    });
  }
};

// Toggle User Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId, active } = req.body;
    
    await db.execute(
      'UPDATE users SET active = ? WHERE id = ?',
      [active === 'true', userId]
    );
    
    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
};

// Toggle Vendor Status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const { vendorId, status } = req.body;
    
    await db.execute(
      'UPDATE vendors SET status = ? WHERE id = ?',
      [status, vendorId]
    );
    
    res.json({ success: true, message: 'Vendor status updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error updating vendor status' });
  }
};

// Get all vendors (API)
exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.execute(
      'SELECT id, vendor_name, category FROM vendors WHERE status = "Active"'
    );
    
    res.json(vendors);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching vendors' });
  }
};
