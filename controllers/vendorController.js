const db = require('../config/database');
const { ORDER_STATUS } = require('../config/constants');

// Vendor Dashboard
exports.dashboard = async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    
    // Get vendor products count
    const [productCount] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE vendor_id = ?',
      [vendorId]
    );
    
    // Get pending orders
    const [pendingOrders] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND order_status = ?',
      [vendorId, ORDER_STATUS.PENDING]
    );
    
    // Get total revenue
    const [revenue] = await db.execute(
      'SELECT SUM(total_amount) as total FROM orders WHERE vendor_id = ? AND order_status = ?',
      [vendorId, ORDER_STATUS.CONFIRMED]
    );
    
    res.render('vendor/dashboard', {
      vendorName: req.session.vendorName,
      stats: {
        products: productCount[0].count,
        pendingOrders: pendingOrders[0].count,
        revenue: revenue[0].total || 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading vendor dashboard',
      statusCode: 500
    });
  }
};

// Your Items
exports.yourItemsPage = async (req, res) => {
  try {
    const [products] = await db.execute(
      'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC',
      [req.session.vendorId]
    );
    
    res.render('vendor/your-items', {
      products,
      vendorName: req.session.vendorName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading items',
      statusCode: 500
    });
  }
};

// Add Item Page
exports.addItemPage = (req, res) => {
  res.render('vendor/add-item', { vendorName: req.session.vendorName });
};

// Add Item Success Page
exports.addItemSuccessPage = (req, res) => {
  const productName = req.query.productName || 'Product';
  res.render('vendor/add-item-success', {
    vendorName: req.session.vendorName,
    productName: productName
  });
};

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { product_name, price, description } = req.body;
    
    // Validate
    if (!product_name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required'
      });
    }
    
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }
    
    await db.execute(
      'INSERT INTO products (vendor_id, product_name, price, description, status) VALUES (?, ?, ?, ?, "Available")',
      [req.session.vendorId, product_name, parseFloat(price), description || '']
    );
    
    res.json({
      success: true,
      message: 'Product added successfully',
      productName: product_name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product'
    });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Check ownership
    const [product] = await db.execute(
      'SELECT vendor_id FROM products WHERE id = ?',
      [productId]
    );
    
    if (product.length === 0 || product[0].vendor_id !== req.session.vendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await db.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

// Product Status  
exports.productStatusPage = async (req, res) => {
  try {
    const [products] = await db.execute(
      'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC',
      [req.session.vendorId]
    );
    
    res.render('vendor/product-status', {
      products,
      vendorName: req.session.vendorName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading product status',
      statusCode: 500
    });
  }
};

// Update Product Status
exports.updateProductStatus = async (req, res) => {
  try {
    const { productId, status } = req.body;
    
    // Check ownership
    const [product] = await db.execute(
      'SELECT vendor_id FROM products WHERE id = ?',
      [productId]
    );
    
    if (product.length === 0 || product[0].vendor_id !== req.session.vendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await db.execute(
      'UPDATE products SET status = ? WHERE id = ?',
      [status, productId]
    );
    
    res.json({ success: true, message: 'Product status updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// Transactions
exports.transactionsPage = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.vendor_id = ?
       ORDER BY o.created_at DESC`,
      [req.session.vendorId]
    );
    
    // Get order items details
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
    
    res.render('vendor/transactions', {
      orders,
      vendorName: req.session.vendorName
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      message: 'Error loading transactions',
      statusCode: 500
    });
  }
};
