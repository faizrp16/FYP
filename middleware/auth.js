// middleware/auth.js

// make sure user is logged in
exports.checkAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Please login first.');
  return res.redirect('/login');
};

// make sure user is admin
exports.checkAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.roleId === 2) {
    return next();
  }
  req.flash('error', 'You are not authorised to view that page.');
  return res.redirect('/');
};
