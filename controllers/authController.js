const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { ROLES } = require('../config/constants');
const { validateEmail, validatePassword, validateUserId, validateNonEmpty } = require('../middleware/validator');

// LOGIN
exports.loginPage = (req, res) => {
  const message = req.query.message || '';
  res.render('auth/login', { message });
};

exports.login = async (req, res) => {
  try {
    const { user_id, password, role } = req.body;
    
    // Validate input
    if (!user_id || !password || !role) {
      return res.status(400).render('auth/login', { 
        message: 'All fields are required',
        messageType: 'error'
      });
    }
    
    // Query user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE user_id = ? AND role = ?',
      [user_id, role]
    );
    
    if (users.length === 0) {
      return res.status(401).render('auth/login', { 
        message: 'Invalid User ID or Password',
        messageType: 'error'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).render('auth/login', { 
        message: 'Invalid User ID or Password',
        messageType: 'error'
      });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(403).render('auth/login', { 
        message: 'User account is inactive',
        messageType: 'error'
      });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.user_id = user.user_id;
    req.session.email = user.email;
    req.session.name = user.name;
    
    // Redirect based on role
    if (user.role === ROLES.ADMIN) {
      res.redirect('/admin/dashboard');
    } else if (user.role === ROLES.VENDOR) {
      // Get vendor details
      const [vendor] = await db.execute(
        'SELECT id, vendor_name FROM vendors WHERE user_id = ?',
        [user.id]
      );
      if (vendor.length > 0) {
        req.session.vendorId = vendor[0].id;
        req.session.vendorName = vendor[0].vendor_name;
      }
      res.redirect('/vendor/dashboard');
    } else {
      res.redirect('/user/dashboard');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', { 
      message: 'An error occurred during login',
      messageType: 'error'
    });
  }
};

// SIGNUP
exports.signupPage = (req, res) => {
  res.render('auth/signup');
};

exports.signup = async (req, res) => {
  try {
    const { role, name, email, user_id, password, category, phone } = req.body;
    
    // Validation
    if (!role || !validateNonEmpty(name) || !validateEmail(email) || !validateUserId(user_id) || !validatePassword(password)) {
      return res.status(400).render('auth/signup', { 
        message: 'Invalid input. Please check all fields.',
        messageType: 'error',
        formData: req.body
      });
    }
    
    // Vendor-specific validation
    if (role === ROLES.VENDOR) {
      if (!category || !validateNonEmpty(phone)) {
        return res.status(400).render('auth/signup', { 
          message: 'Vendors must provide category and phone.',
          messageType: 'error',
          formData: req.body
        });
      }
      
      if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).render('auth/signup', { 
          message: 'Phone must be 10 digits.',
          messageType: 'error',
          formData: req.body
        });
      }
    }
    
    // Check duplicate user_id
    const [existingUserId] = await db.execute(
      'SELECT id FROM users WHERE user_id = ?',
      [user_id]
    );
    
    if (existingUserId.length > 0) {
      return res.status(400).render('auth/signup', { 
        message: 'User ID already exists.',
        messageType: 'error',
        formData: req.body
      });
    }
    
    // Check duplicate email
    const [existingEmail] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmail.length > 0) {
      return res.status(400).render('auth/signup', { 
        message: 'Email already registered.',
        messageType: 'error',
        formData: req.body
      });
    }
    
    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (user_id, password_hash, email, name, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [user_id, passwordHash, email, name, role]
    );
    
    const newUserId = result.insertId;
    
    // If vendor, create vendor record
    if (role === ROLES.VENDOR) {
      await db.execute(
        'INSERT INTO vendors (user_id, vendor_name, category, email, phone, status) VALUES (?, ?, ?, ?, ?, "Active")',
        [newUserId, name, category, email, phone]
      );
    }
    
    res.render('auth/signup-success', { 
      message: 'Registration successful! Please login with your credentials.',
      user_id,
      role
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).render('auth/signup', { 
      message: 'An error occurred during registration.',
      messageType: 'error',
      formData: req.body
    });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { 
        message: 'Logout failed',
        statusCode: 500
      });
    }
    res.redirect('/');
  });
};
