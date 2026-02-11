const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const sessionMiddleware = require('./config/sessionConfig');
const { ROLES } = require('./config/constants');

// Load environment variables
dotenv.config();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);

// Session check middleware (add to res.locals)
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userRole = req.session.userRole;
  res.locals.userName = req.session.name;
  res.locals.user_id = req.session.user_id;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/vendor', require('./routes/vendor'));
app.use('/user', require('./routes/user'));
app.use('/reports', require('./routes/reports'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    message: 'An error occurred',
    statusCode: 500
  });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    statusCode: 404
  });
});

module.exports = app;
