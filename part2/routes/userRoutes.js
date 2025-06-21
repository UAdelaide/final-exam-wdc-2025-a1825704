const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', function (req, res) {
    return res.redirect('/users/login');
});

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
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
      res.redirect('/users/owner');
    } else {
      res.redirect('/users/walk');
    }

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /users/login  –  show the login form
router.get('/login', (req, res) => {
  try {
    db.query('SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username FROM Dogs INNER JOIN Users ON Users.user_id = Dogs.owner_id', (err, results) => {
        if (err) {
            console.log('Error Fetching Dogs:', err);
            return res.status(500).send('Could not load dogs');
        }
        res.render('login', { dogs: results });
    });
} catch(err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

// GET /users/walk  –  walker dashboard (must be a logged‑in walker)
router.get('/walk', (req, res) => {
  res.render('../public/walker-dashboard.html');
});

// GET /users/owner  –  owner dashboard (must be a logged‑in owner)
router.get('/owner', (req, res) => {
  res.render('../public/owner-dashboard.html');
});

// POST /users/logout  –  clear the session and send back to login
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/users/login');
  });
});

module.exports = router;
