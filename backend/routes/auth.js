const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const wrap = require('../middleware/wrap');

// POST /api/auth/register
router.post('/register', wrap(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Valid email and a password of at least 6 characters are required' });
  }

  // 2. Normalize email to prevent duplicate accounts (e.g., "Test@mail.com" vs "test@mail.com")
  const cleanEmail = email.trim().toLowerCase();

  // 3. Check if user already exists
  if (await User.findOne({ email: cleanEmail })) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  // 4. Hash the password securely and create the user
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email: cleanEmail, password: hashedPassword });

  res.status(201).json({ message: 'User created successfully' });
}));

// POST /api/auth/login
router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // 2. Find the user by normalized email
  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  // 3. Verify user exists and compare passwords safely
  const isMatch = user && await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // 4. Generate a JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' } // Set to '1d' (from file 1) or '2h' (from file 2) based on your preference
  );

  res.json({ token, email: user.email });
}));

module.exports = router;