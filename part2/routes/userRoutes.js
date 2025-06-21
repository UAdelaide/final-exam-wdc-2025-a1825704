const express = require('express');
const router = express.Router();
const db = require('../models/db');

function requireRole(role) {
  return function (req, res, next) {
    if (!req.session.user || req.session.user.role !== role) {
      return res.redirect('/users/login');
    }
    next();
  };
}

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: rows[0].user_id,
      username: username,
      email: rows[0].email,
      role: rows[0].role
    };

    if (rows[0].role === 'owner') {
      res.redirect('/owner');
    } else {
      res.redirect('/walk');
    }

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /users/login  –  show the login form
router.get('/login', (req, res) => {
  res.render('login');
});

// GET /users/walk  –  walker dashboard (must be a logged‑in walker)
router.get('/walk', requireRole('walker'), (req, res) => {
  res.render('walker_dashboard', { walkerId: req.session.user.id });
});

// GET /users/owner  –  owner dashboard (must be a logged‑in owner)
router.get('/owner', requireRole('owner'), (req, res) => {
  res.render('owner-dashboard', { ownerId: req.session.user.id });
});

// POST /users/logout  –  clear the session and send back to login
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/users/login');
  });
});

// Logout
router.post('/logout', function (req, res) {
    if (req.session.user !== undefined) {
        delete req.session.user;
    }
    res.redirect('/users/login');
});

module.exports = router;
