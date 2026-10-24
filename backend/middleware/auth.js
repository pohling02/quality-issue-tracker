const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get the token from the header (format: "Bearer <token>")
  const authHeader = req.header('Authorization');

  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};