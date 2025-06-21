const express = require('express');
const router = express.Router();
const db = require('../models/db');

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

// Standard username/password login
router.post('/login', (req, res) => {
    // Gets username and password from the inputs
    const { username, password } = req.body;

    // Checks that there is both a username and password
    if (username && password) {
            // Searches Users table in db for matching username
            const query = "SELECT * FROM Users WHERE username = ?";
            db.query(query, [username], (error, results) => {
                if (error) {
                    console.error("Query error:", error);
                    return res.sendStatus(500);
                }

                // No results returns an error
                if (results.length === 0) {
                    return res.status(401).render('login', { error: "Invalid username or password" });
                }

                const user = results[0];

                    // If the passwords don't match send an error
                    if (password !== user.password) {
                        return res.status(401).render('login', { error: "Invalid username or password" });
                    }
                    req.session.user = {
                        id: user.uers_id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                    if(user.role === 'owner') {
                      res.redirect('/owner');
                    } else {
                      res.redirect('/walk');
                    }
            });
        });
    }
    else {
        return res.status(400).send("Please provide login credentials");
    }
});

router.get('/login', function (req, res) {
    res.render('login');
});


// Logout
router.post('/logout', function (req, res) {
    if (req.session.user !== undefined) {
        delete req.session.user;
    }
    res.redirect('/users/login');
});

module.exports = router;
