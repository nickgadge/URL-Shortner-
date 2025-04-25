const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.cookies['auth-token'];
  if (!token) {
    return res.redirect('/auth/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/auth/login');
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
