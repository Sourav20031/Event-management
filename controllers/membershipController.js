const db = require('../config/database');
const { MEMBERSHIP_DURATION, MEMBERSHIP_STATUS, MEMBERSHIP_ACTIONS } = require('../config/constants');

// Generate unique membership number
const generateMembershipNo = async () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [result] = await db.execute(
    `SELECT membership_no FROM vendor_memberships 
     WHERE membership_no LIKE ? 
     ORDER BY membership_no DESC LIMIT 1`,
    [`MEM-${today}-%`]
  );
  
  let seq = 1;
  if (result.length > 0) {
    const lastNo = result[0].membership_no;
    seq = parseInt(lastNo.split('-')[2]) + 1;
  }
  
  return `MEM-${today}-${String(seq).padStart(3, '0')}`;
};

// Add Membership (Admin only)
exports.addMembershipPage = async (req, res) => {
  try {
    // Get all vendors
    const [vendors] = await db.execute(
      'SELECT v.id, v.vendor_name, v.category FROM vendors v WHERE v.status = "Active"'
    );
    
    res.render('admin/membership/add', { vendors });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading add membership page',
      statusCode: 500
    });
  }
};

exports.addMembership = async (req, res) => {
  try {
    const { vendor_id, membershipDuration } = req.body;
    
    // Validate input
    if (!vendor_id || !membershipDuration) {
      const [vendors] = await db.execute(
        'SELECT v.id, v.vendor_name, v.category FROM vendors v WHERE v.status = "Active"'
      );
      return res.status(400).render('admin/membership/add', { 
        vendors,
        message: 'All fields are required',
        messageType: 'error'
      });
    }
    
    if (!MEMBERSHIP_DURATION[membershipDuration]) {
      const [vendors] = await db.execute(
        'SELECT v.id, v.vendor_name, v.category FROM vendors v WHERE v.status = "Active"'
      );
      return res.status(400).render('admin/membership/add', { 
        vendors,
        message: 'Invalid duration selected',
        messageType: 'error'
      });
    }
    
    // Check vendor exists
    const [vendor] = await db.execute(
      'SELECT id, vendor_name FROM vendors WHERE id = ? AND status = "Active"',
      [vendor_id]
    );
    
    if (vendor.length === 0) {
      const [vendors] = await db.execute(
        'SELECT v.id, v.vendor_name, v.category FROM vendors v WHERE v.status = "Active"'
      );
      return res.status(404).render('admin/membership/add', { 
        vendors,
        message: 'Vendor not found',
        messageType: 'error'
      });
    }
    
    // Check if vendor already has active membership
    const [activeMembership] = await db.execute(
      'SELECT id FROM vendor_memberships WHERE vendor_id = ? AND status = "Active"',
      [vendor_id]
    );
    
    if (activeMembership.length > 0) {
      const [vendors] = await db.execute(
        'SELECT v.id, v.vendor_name, v.category FROM vendors v WHERE v.status = "Active"'
      );
      return res.status(400).render('admin/membership/add', { 
        vendors,
        message: 'Vendor already has an active membership',
        messageType: 'error'
      });
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    const months = MEMBERSHIP_DURATION[membershipDuration].months;
    endDate.setMonth(endDate.getMonth() + months);
    
    // Generate membership number
    const membershipNo = await generateMembershipNo();
    
    // Insert membership
    const [result] = await db.execute(
      `INSERT INTO vendor_memberships 
       (vendor_id, membership_no, start_date, end_date, membership_duration, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'Active', ?)`,
      [vendor_id, membershipNo, startDate, endDate, membershipDuration, req.session.userId]
    );
    
    // Log action
    await db.execute(
      `INSERT INTO membership_updates 
       (membership_id, action_type, duration_months, new_end_date)
       VALUES (?, ?, ?, ?)`,
      [result.insertId, MEMBERSHIP_ACTIONS.CREATED, months, endDate]
    );
    
    res.render('admin/membership/add-success', { 
      message: 'Membership created successfully',
      membershipNo,
      vendorName: vendor[0].vendor_name,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error('Add membership error:', error);
    res.status(500).render('error', { 
      message: 'Error creating membership',
      statusCode: 500
    });
  }
};

// Update Membership Page
exports.updateMembershipPage = (req, res) => {
  res.render('admin/membership/update');
};

// Get Membership Details (API)
exports.getMembership = async (req, res) => {
  try {
    const { membershipNo } = req.params;
    
    const [result] = await db.execute(
      `SELECT vm.*, v.vendor_name 
       FROM vendor_memberships vm
       JOIN vendors v ON vm.vendor_id = v.id
       WHERE vm.membership_no = ?`,
      [membershipNo]
    );
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    res.json(result[0]);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching membership' });
  }
};

// Update Membership
exports.updateMembership = async (req, res) => {
  try {
    const { membership_id, action, extensionDuration, cancellation_reason } = req.body;
    
    // Validate input
    if (!membership_id || !action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input' 
      });
    }
    
    // Get current membership
    const [membership] = await db.execute(
      'SELECT * FROM vendor_memberships WHERE id = ?',
      [membership_id]
    );
    
    if (membership.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Membership not found' 
      });
    }
    
    const mem = membership[0];
    let successMessage = '';
    
    if (action === 'extend') {
      // Validate extension duration
      if (!extensionDuration || !MEMBERSHIP_DURATION[extensionDuration]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid extension duration' 
        });
      }
      
      // Calculate new end date
      let newEndDate = new Date(mem.end_date);
      const months = MEMBERSHIP_DURATION[extensionDuration].months;
      newEndDate.setMonth(newEndDate.getMonth() + months);
      
      // Update
      await db.execute(
        'UPDATE vendor_memberships SET end_date = ?, status = "Active", updated_by = ? WHERE id = ?',
        [newEndDate, req.session.userId, membership_id]
      );
      
      // Log
      await db.execute(
        `INSERT INTO membership_updates 
         (membership_id, action_type, duration_months, old_end_date, new_end_date)
         VALUES (?, ?, ?, ?, ?)`,
        [membership_id, MEMBERSHIP_ACTIONS.EXTENDED, months, mem.end_date, newEndDate]
      );
      
      successMessage = 'Membership extended successfully';
      
    } else if (action === 'cancel') {
      // Cancel
      const cancellationDate = new Date();
      await db.execute(
        `UPDATE vendor_memberships 
         SET status = 'Cancelled', cancellation_date = ?, updated_by = ? 
         WHERE id = ?`,
        [cancellationDate, req.session.userId, membership_id]
      );
      
      // Log
      await db.execute(
        `INSERT INTO membership_updates 
         (membership_id, action_type, remarks)
         VALUES (?, ?, ?)`,
        [membership_id, MEMBERSHIP_ACTIONS.CANCELLED, cancellation_reason || '']
      );
      
      successMessage = 'Membership cancelled successfully';
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action' 
      });
    }
    
    res.json({ 
      success: true, 
      message: successMessage 
    });
    
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating membership' 
    });
  }
};
