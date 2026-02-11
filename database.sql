-- Event Management System Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- USERS TABLE (Admin, User, Vendor)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100),
  role ENUM('Admin', 'User', 'Vendor') NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VENDOR DETAILS (For Vendor users)
CREATE TABLE vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  vendor_name VARCHAR(100),
  category ENUM('Catering', 'Florist', 'Decoration', 'Lighting') NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VENDOR MEMBERSHIP (Admin manages this)
CREATE TABLE vendor_memberships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  membership_no VARCHAR(50) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  membership_duration ENUM('6_months', '1_year', '2_years') NOT NULL,
  status ENUM('Active', 'Expired', 'Cancelled') DEFAULT 'Active',
  cancellation_date DATE NULL,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VENDOR MEMBERSHIP UPDATES LOG
CREATE TABLE membership_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  membership_id INT NOT NULL,
  action_type ENUM('Created', 'Extended', 'Cancelled') NOT NULL,
  duration_months INT,
  old_end_date DATE,
  new_end_date DATE,
  remarks TEXT,
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_id) REFERENCES vendor_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRODUCTS (Vendor's items/services)
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  status ENUM('Available', 'Unavailable') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORDERS (User orders)
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  vendor_id INT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  order_status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORDER ITEMS
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CART (Session-based)
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GUEST LISTS
CREATE TABLE guest_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  list_name VARCHAR(100) NOT NULL,
  guest_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GUEST LIST ENTRIES
CREATE TABLE guest_list_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guest_list_id INT NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  FOREIGN KEY (guest_list_id) REFERENCES guest_lists(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Indexes for better performance
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_vendor_category ON vendors(category);
CREATE INDEX idx_vendor_status ON vendors(status);
CREATE INDEX idx_product_vendor ON products(vendor_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_vendor ON orders(vendor_id);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_membership_vendor ON vendor_memberships(vendor_id);
CREATE INDEX idx_membership_status ON vendor_memberships(status);

-- INSERT DEFAULT USERS FOR TESTING
-- Admin User: admin1 / Admin@123
INSERT INTO users (user_id, password_hash, email, name, role, active) VALUES
('admin1', '$2a$10$6K/G0ndv0G.I.K9zchgHfuP29VN7olI4kr7GpAHeBeKD.ZeOh/QAy', 'admin@event.com', 'Admin User', 'Admin', TRUE);

-- Sample Vendor User: vendor1 / Vendor@123
INSERT INTO users (user_id, password_hash, email, name, role, active) VALUES
('vendor1', '$2a$10$/h5qCzKwOjl7vW3V4lE5Uuv0z7V5xR6fK4yJm8nL2oP1qS0tT9eUi', 'vendor@catering.com', 'Catering Vendor', 'Vendor', TRUE);

-- Sample User: user1 / User@123
INSERT INTO users (user_id, password_hash, email, name, role, active) VALUES
('user1', '$2a$10$6K/G0ndv0G.I.K9zchgHfuP29VN7olI4kr7GpAHeBeKD.ZeOh/QAy', 'user@event.com', 'Sample User', 'User', TRUE);

-- Insert sample vendor details for vendor1
INSERT INTO vendors (user_id, vendor_name, category, contact_person, email, phone, status) VALUES
(2, 'Delicious Catering', 'Catering', 'John Smith', 'john@catering.com', '9876543210', 'Active');
