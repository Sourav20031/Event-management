# Event Management System

A comprehensive web-based Event Management System with role-based access control for Admin, Vendor, and User roles.

## System Overview

### Architecture
- **Backend**: Node.js with Express.js
- **Frontend**: EJS templating with embedded CSS
- **Database**: MySQL with connection pooling
- **Authentication**: Session-based with bcrypt password hashing
- **Authorization**: Role-based access control (RBAC)

### Roles & Access Control

| Feature | Admin | Vendor | User |
|---------|-------|--------|------|
| Login | ✅ | ✅ | ✅ |
| Browse Vendors | - | - | ✅ |
| View Products | - | ✅ (own) | ✅ |
| Add/Update Products | - | ✅ | - |
| Manage Memberships | ✅ | - | - |
| Manage Users | ✅ | - | - |
| Manage Vendors | ✅ | - | - |
| Browse/Order Products | - | - | ✅ |
| View Cart | - | - | ✅ |
| Create Orders | - | - | ✅ |
| View Reports | ✅ | ✅ | ✅ |
| Manage Guest Lists | - | - | ✅ |

---

## Project Structure

```
event-management/
├── config/
│   ├── constants.js          # App constants, roles, statuses
│   ├── database.js           # MySQL connection pool
│   └── sessionConfig.js      # Express-session configuration
├── middleware/
│   ├── auth.js               # Authentication & authorization middleware
│   └── validator.js          # Input validation helpers
├── controllers/
│   ├── authController.js     # Login, signup, logout
│   ├── adminController.js    # Admin operations
│   ├── membershipController.js # Vendor membership management
│   ├── vendorController.js   # Vendor operations
│   └── userController.js     # User operations (cart, orders, etc.)
├── routes/
│   ├── index.js              # Home page
│   ├── auth.js               # Authentication routes
│   ├── admin.js              # Admin routes
│   ├── vendor.js             # Vendor routes
│   ├── user.js               # User routes
│   └── reports.js            # Reports for all roles
├── views/
│   ├── auth/                 # Login & signup pages
│   ├── admin/                # Admin pages
│   ├── vendor/               # Vendor pages
│   ├── user/                 # User pages
│   ├── reports/              # Reports pages
│   └── layouts/              # Layout templates
├── public/                   # Static assets
├── database.sql              # Database schema
├── app.js                    # Express app setup
├── server.js                 # Server entry point
├── package.json              # Dependencies
└── .env                      # Environment variables
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm

### 2. Database Setup

```bash
# Open MySQL CLI and run:
mysql -u root -p < database.sql

# Or manually import database.sql from the workbench
```

### 3. Install Dependencies
```bash
cd Event-management
npm install
```

### 4. Configure Environment Variables
Edit `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_management
SESSION_SECRET=your_session_secret
PORT=3000
NODE_ENV=development
```

### 5. Start the Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Access the application at: **http://localhost:3000**

---

## Features Implemented

### ✅ Authentication Module
- [x] Login page with role selection (Admin/Vendor/User)
- [x] Signup page with role-specific fields
- [x] Password hashing with bcryptjs
- [x] Session management (24-hour expiry)
- [x] Logout functionality
- [x] Password field masking (type="password")
- [x] Form validations (client & server-side)

### ✅ Admin Module
- [x] Admin Dashboard with statistics
- [x] Maintenance Menu
- [x] **Add Membership for Vendor**
  - Mandatory: All fields required
  - Membership duration: 6 months (default), 1 year, 2 years
  - Auto-generate membership number (MEM-YYYYMMDD-XXX)
  - Calculate start and end dates automatically
- [x] **Update Membership for Vendor**
  - Search by membership number
  - Extend membership (6 months default)
  - Cancel membership with reason
  - Update audit trail
- [x] User Management (activate/deactivate)
- [x] Vendor Management (status control)

### ✅ Vendor Module
- [x] Vendor Dashboard with statistics
- [x] Your Products List
- [x] Add New Product
- [x] Product Status Management
- [x] Transactions/Orders View
- [x] Vendor Reports

### ✅ User Module
- [x] User Dashboard
- [x] Browse Vendors (with category filter)
- [x] View Vendor Products
- [x] Add to Cart
- [x] View Cart
- [x] Update Cart Quantities
- [x] Delete Cart Items
- [x] Checkout (per vendor)
- [x] Place Orders
- [x] View Order Status
- [x] Guest List Management
- [x] User Reports

### ✅ Reports Module
- [x] Admin Reports (membership, vendor, user, order statistics)
- [x] Vendor Reports (product stats, order stats, top products)
- [x] User Reports (order stats, spending by vendor)

### ✅ Database Tables
- [x] users (Admin, User, Vendor)
- [x] vendors (vendor details with categories)
- [x] vendor_memberships (membership management)
- [x] membership_updates (audit log)
- [x] products (vendor items)
- [x] orders (user orders)
- [x] order_items (order line items)
- [x] cart_items (shopping cart)
- [x] guest_lists (user guest management)
- [x] guest_list_entries (guest details)

### ✅ Security Features
- [x] Role-based access control (RBAC)
- [x] Session-based authentication
- [x] Password hashing with bcryptjs
- [x] SQL injection prevention (parameterized queries)
- [x] CSRF protection via session tokens
- [x] HTTPOnly cookies for session
- [x] Input validation (client & server)

### ✅ Validations
- [x] Email format validation
- [x] Phone number (10 digits) validation
- [x] Password strength (8+ chars, 1 uppercase, 1 number)
- [x] Mandatory field validation
- [x] Duplicate user_id/email checking
- [x] Product price validation
- [x] Stock/availability checking

---

## Test Accounts

### Admin Account
- **User ID**: admin1
- **Password**: Admin@123

### Vendor Account
- **User ID**: vendor1
- **Password**: Vendor@123
- **Category**: Catering

### User Account
- **User ID**: user1
- **Password**: User@123

---

## Testing Workflows

### 1. Admin Workflow
```
1. Login with admin1 / Admin@123
2. Navigate to "Maintenance Menu"
3. Add Membership:
   - Select vendor
   - Duration: 6 months (default)
   - Verify membership number created
4. Update Membership:
   - Search by membership number
   - Extend or Cancel
5. View Reports
```

### 2. Vendor Workflow
```
1. Login with vendor1 / Vendor@123
2. Add New Item:
   - Enter product name, price, description
   - Verify product created
3. Your Items:
   - View all products
4. Product Status:
   - Change availability
5. Transactions:
   - View orders from users
6. View Reports
```

### 3. User Workflow
```
1. Login with user1 / User@123
2. Browse Vendors:
   - Filter by category (optional)
   - Click "Browse Products"
3. View Products:
   - See vendor details
   - Add items to cart
4. View Cart:
   - See grouped by vendor
   - Update quantities
   - Delete items
5. Checkout:
   - Select payment method
   - Place order
6. Order Status:
   - View all orders
   - See items in each order
7. Guest List:
   - Create new guest list
8. View Reports
```

---

## Key Business Rules

### Membership Management
- **Add Membership**: All fields mandatory, default 6 months, auto-generates membership number
- **Update Membership**: 
  - Requires membership number
  - Default extension = 6 months
  - Can extend or cancel
  - Cancellation sets status='Cancelled' and records date

### Product Management
- Only vendors can add/manage their own products
- Products must have name and price
- Products can be marked Available/Unavailable

### Order Processing
- Cart grouped by vendor
- Each checkout is per vendor
- Orders marked as Confirmed after placement
- Audit trail maintained

### Session Management
- 24-hour session timeout
- HTTPOnly cookies
- Session stored in memory (can be upgraded to Redis)
- Back button after logout doesn't reopen pages

---

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /authenticate` - Process login
- `GET /signup` - Signup page
- `POST /register` - Process signup
- `GET /logout` - Logout user

### Admin
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/add-membership` - Add membership page
- `POST /admin/add-membership` - Create membership
- `GET /admin/update-membership` - Update membership page
- `POST /admin/update-membership` - Process update
- `GET /admin/user-management` - User management
- `GET /admin/vendor-management` - Vendor management

### Vendor
- `GET /vendor/dashboard` - Vendor dashboard
- `GET /vendor/your-items` - Product list
- `GET /vendor/add-item` - Add item page
- `POST /vendor/add-item` - Create product
- `GET /vendor/product-status` - Status management
- `POST /vendor/update-product-status` - Update status
- `GET /vendor/transactions` - View orders

### User
- `GET /user/dashboard` - User dashboard
- `GET /user/vendors` - Browse vendors
- `GET /user/vendor/:vendorId/products` - Vendor products
- `POST /user/cart/add` - Add to cart
- `GET /user/cart` - View cart
- `POST /user/cart/update` - Update quantity
- `POST /user/cart/delete` - Remove item
- `GET /user/checkout/:vendorId` - Checkout page
- `POST /user/place-order` - Create order
- `GET /user/order-status` - View orders
- `GET /user/guest-list` - Guest lists
- `POST /user/guest-list/create` - Create guest list

### Reports
- `GET /reports/admin` - Admin reports
- `GET /reports/vendor` - Vendor reports
- `GET /reports/user` - User reports

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
Solution: 
- Check MySQL is running
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Ensure database 'event_management' exists
```

### Session/Logout Issues
```
Error: Cannot logout or session not persisting
Solution:
- Check cookies are enabled
- Verify SESSION_SECRET in .env
- Clear browser cookies/cache
```

### EJS Template Errors
```
Error: ReferenceError: variable is not defined
Solution:
- Verify all views pass required variables from controllers
- Check EJS syntax (<%=, <%, <%- %>)
```

---

## File Checklist

### Controllers ✅
- [x] authController.js (complete)
- [x] adminController.js (complete)
- [x] membershipController.js (complete)
- [x] vendorController.js (complete)
- [x] userController.js (complete)

### Routes ✅
- [x] index.js (complete)
- [x] auth.js (complete)
- [x] admin.js (complete)
- [x] vendor.js (complete)
- [x] user.js (complete)
- [x] reports.js (complete)

### Views ✅
- [x] index.ejs
- [x] auth/ (login.ejs, signup.ejs, signup-success.ejs)
- [x] admin/ (dashboard.ejs, maintenance-menu.ejs, user-management.ejs, vendor-management.ejs)
- [x] admin/membership/ (add.ejs, update.ejs, add-success.ejs)
- [x] vendor/ (dashboard.ejs, your-items.ejs, add-item.ejs, add-item-success.ejs, product-status.ejs, transactions.ejs)
- [x] user/ (dashboard.ejs, vendors-list.ejs, vendor-products.ejs, cart.ejs, checkout.ejs, order-status.ejs, guest-list.ejs)
- [x] reports/ (admin.ejs, vendor.ejs, user.ejs)

### Config ✅
- [x] constants.js
- [x] database.js
- [x] sessionConfig.js

### Middleware ✅
- [x] auth.js
- [x] validator.js

### Database ✅
- [x] database.sql

### Root Files ✅
- [x] app.js
- [x] server.js
- [x] package.json
- [x] .env

---

## Performance Notes

- MySQL connection pooling enabled (10 connections)
- Indexes created on frequently queried columns
- Session timeout set to 24 hours
- Database queries optimized with JOINs

---

## Future Enhancements

- [ ] Email notifications for order confirmations
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] PDF export for reports and invoices
- [ ] Real-time order tracking with WebSockets
- [ ] Image upload for products
- [ ] User profile management
- [ ] Vendor ratings/reviews
- [ ] Search and advanced filtering
- [ ] Inventory management
- [ ] Analytics dashboard

---

## License

This project is created for academic purposes.

---

## Support

For issues or questions, refer to:
1. The assignment specification in `assigment.md`
2. Database schema in `database.sql`
3. Controller implementations in `controllers/`
4. Route definitions in `routes/`

---

**Last Updated**: February 11, 2026
