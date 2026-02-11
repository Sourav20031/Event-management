// Middleware: Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login?message=Please login first');
  }
  next();
};

// Middleware: Check role-based access
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).redirect('/login?message=Please login first');
    }
    
    if (!allowedRoles.includes(req.session.userRole)) {
      return res.status(403).render('error', {
        message: 'Access Denied - You do not have permission to access this page',
        statusCode: 403
      });
    }
    
    next();
  };
};

// Middleware: Optional role check for API endpoints
const checkRoleAPI = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Access Denied' });
    }
    
    next();
  };
};

module.exports = {
  isAuthenticated,
  requireRole,
  checkRoleAPI
};
