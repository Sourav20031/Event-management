const express = require('express');
const router = express.Router();

// Index route
router.get('/', (req, res) => {
  res.render('index', { 
    isAuthenticated: !!req.session.userId,
    userRole: req.session.userRole,
    userName: req.session.name
  });
});

module.exports = router;
