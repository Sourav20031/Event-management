const db = require('../config/database');
const { ORDER_STATUS } = require('../config/constants');

// User Dashboard
exports.dashboard = async (req, res) => {
  try {
    // Get pending cart count
    const [cartCount] = await db.execute(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [req.session.userId]
    );
    
    // Get orders count
    const [orderCount] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [req.session.userId]
    );
    
    res.render('user/dashboard', {
      name: req.session.name,
      stats: {
        cartItems: cartCount[0].count,
        orders: orderCount[0].count
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading user dashboard',
      statusCode: 500
    });
  }
};

// Browse Vendors
exports.vendorsPage = async (req, res) => {
  try {
    const category = req.query.category || '';
    
    let query = `SELECT v.*, COUNT(p.id) as product_count
                 FROM vendors v
                 LEFT JOIN products p ON v.id = p.vendor_id
                 WHERE v.status = 'Active'`;
    let params = [];
    
    if (category) {
      query += ' AND v.category = ?';
      params.push(category);
    }
    
    query += ' GROUP BY v.id ORDER BY v.vendor_name';
    
    const [vendors] = await db.execute(query, params);
    
    // Get cart count
    const [cartCount] = await db.execute(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [req.session.userId]
    );
    
    res.render('user/vendors-list', {
      vendors,
      name: req.session.name,
      selectedCategory: category,
      cartItemCount: cartCount[0].count
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading vendors',
      statusCode: 500
    });
  }
};

// Vendor Products
exports.vendorProductsPage = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Get vendor details
    const [vendor] = await db.execute(
      'SELECT * FROM vendors WHERE id = ? AND status = "Active"',
      [vendorId]
    );
    
    if (vendor.length === 0) {
      return res.status(404).render('error', {
        message: 'Vendor not found',
        statusCode: 404
      });
    }
    
    // Get vendor products
    const [products] = await db.execute(
      'SELECT * FROM products WHERE vendor_id = ? AND status = "Available" ORDER BY product_name',
      [vendorId]
    );
    
    // Get user's cart for this vendor
    const [cartItems] = await db.execute(
      `SELECT oi.product_id, oi.quantity
       FROM cart_items oi
       WHERE oi.user_id = ? AND oi.product_id IN (
         SELECT id FROM products WHERE vendor_id = ?
       )`,
      [req.session.userId, vendorId]
    );
    
    const cartMap = {};
    cartItems.forEach(item => {
      cartMap[item.product_id] = item.quantity;
    });
    
    res.render('user/vendor-products', {
      vendor: vendor[0],
      products,
      cartMap,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading products',
      statusCode: 500
    });
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate
    if (!productId || !quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product or quantity' 
      });
    }
    
    // Check product exists
    const [product] = await db.execute(
      'SELECT id FROM products WHERE id = ? AND status = "Available"',
      [productId]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Check if already in cart
    const [existing] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.session.userId, productId]
    );
    
    if (existing.length > 0) {
      // Update quantity
      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [parseInt(quantity), existing[0].id]
      );
    } else {
      // Insert new
      await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.session.userId, productId, parseInt(quantity)]
      );
    }
    
    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart' });
  }
};

// View Cart
exports.cartPage = async (req, res) => {
  try {
    const [cartItems] = await db.execute(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.product_name, p.price, v.id as vendor_id, v.vendor_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN vendors v ON p.vendor_id = v.id
       WHERE ci.user_id = ?
       ORDER BY v.vendor_name`,
      [req.session.userId]
    );
    
    // Group by vendor
    const cartByVendor = {};
    let grandTotal = 0;
    
    cartItems.forEach(item => {
      if (!cartByVendor[item.vendor_id]) {
        cartByVendor[item.vendor_id] = {
          vendor_id: item.vendor_id,
          vendor_name: item.vendor_name,
          items: [],
          vendor_total: 0
        };
      }
      
      item.totalPrice = item.price * item.quantity;
      cartByVendor[item.vendor_id].items.push(item);
      cartByVendor[item.vendor_id].vendor_total += item.totalPrice;
      grandTotal += item.totalPrice;
    });
    
    // Convert object to array
    const vendorCart = Object.values(cartByVendor);
    
    res.render('user/cart', {
      vendorCart,
      cartItems,
      grandTotal,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading cart',
      statusCode: 500
    });
  }
};

// Update Cart Quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    
    if (!cartItemId || !quantity || parseInt(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }
    
    // Check ownership
    const [item] = await db.execute(
      'SELECT user_id FROM cart_items WHERE id = ?',
      [cartItemId]
    );
    
    if (item.length === 0 || item[0].user_id !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [parseInt(quantity), cartItemId]
    );
    
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
};

// Delete Cart Item
exports.deleteCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    
    // Check ownership
    const [item] = await db.execute(
      'SELECT user_id FROM cart_items WHERE id = ?',
      [cartItemId]
    );
    
    if (item.length === 0 || item[0].user_id !== req.session.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await db.execute(
      'DELETE FROM cart_items WHERE id = ?',
      [cartItemId]
    );
    
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting item' });
  }
};

// Checkout Page
exports.checkoutPage = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    
    // Get cart items for this vendor
    const [cartItems] = await db.execute(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.product_name, p.price, v.id as vendor_id, v.vendor_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN vendors v ON p.vendor_id = v.id
       WHERE ci.user_id = ? AND v.id = ?
       ORDER BY p.product_name`,
      [req.session.userId, vendorId]
    );
    
    if (cartItems.length === 0) {
      return res.status(400).render('error', {
        message: 'Cart is empty',
        statusCode: 400
      });
    }
    
    let total = 0;
    cartItems.forEach(item => {
      item.totalPrice = item.price * item.quantity;
      total += item.totalPrice;
    });
    
    res.render('user/checkout', {
      cartItems,
      vendor: { id: vendorId, name: cartItems[0].vendor_name },
      total,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading checkout',
      statusCode: 500
    });
  }
};

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const { vendorId, paymentMethod } = req.body;
    
    if (!vendorId || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vendor and payment method required' 
      });
    }
    
    // Get cart items
    const [cartItems] = await db.execute(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.vendor_id = ?`,
      [req.session.userId, vendorId]
    );
    
    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    // Calculate total
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.price * item.quantity;
    });
    
    // Generate order number
    const orderNumber = 'ORD-' + Date.now();
    
    // Create order
    const [result] = await db.execute(
      `INSERT INTO orders (order_number, user_id, vendor_id, total_amount, payment_method, order_status)
       VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
      [orderNumber, req.session.userId, vendorId, totalAmount, paymentMethod]
    );
    
    const orderId = result.insertId;
    
    // Insert order items
    for (let item of cartItems) {
      await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity]
      );
    }
    
    // Delete cart items for this vendor
    await db.execute(
      `DELETE FROM cart_items WHERE id IN (
        SELECT ci.id FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ? AND p.vendor_id = ?
      )`,
      [req.session.userId, vendorId]
    );
    
    res.json({ 
      success: true, 
      message: 'Order placed successfully',
      orderId,
      orderNumber
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
};

// Order Status
exports.orderStatusPage = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, v.vendor_name
       FROM orders o
       JOIN vendors v ON o.vendor_id = v.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.session.userId]
    );
    
    // Get items for each order
    for (let order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, p.product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    res.render('user/order-status', {
      orders,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading orders',
      statusCode: 500
    });
  }
};

// Guest List
exports.guestListPage = async (req, res) => {
  try {
    const [guestLists] = await db.execute(
      `SELECT gl.*, COUNT(gle.id) as entry_count
       FROM guest_lists gl
       LEFT JOIN guest_list_entries gle ON gl.id = gle.guest_list_id
       WHERE gl.user_id = ?
       GROUP BY gl.id
       ORDER BY gl.created_at DESC`,
      [req.session.userId]
    );
    
    res.render('user/guest-list', {
      guestLists,
      name: req.session.name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading guest lists',
      statusCode: 500
    });
  }
};

// Create Guest List
exports.createGuestList = async (req, res) => {
  try {
    const { listName } = req.body;
    
    if (!listName || listName.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'List name is required' 
      });
    }
    
    await db.execute(
      'INSERT INTO guest_lists (user_id, list_name) VALUES (?, ?)',
      [req.session.userId, listName]
    );
    
    res.json({ success: true, message: 'Guest list created' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error creating guest list' });
  }
};
