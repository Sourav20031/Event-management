const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_change_this_in_production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: 'strict'
  }
});

module.exports = sessionMiddleware;
