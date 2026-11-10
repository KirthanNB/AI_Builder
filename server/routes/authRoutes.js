import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await UserModel.findByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      credits: 20, // 20 free starter credits
      plan: 'free',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        credits: user.credits ?? 20,
        plan: user.plan || 'free',
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate. Please try again.' });
  }
});

// Get current user session
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: req.user,
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Signed out successfully.' });
});

export default router;

