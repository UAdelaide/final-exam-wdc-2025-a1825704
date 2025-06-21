var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.client_ID;
const client = new OAuth2Client(CLIENT_ID);
const { body, validationResult } = require('express-validator');

// Standard username/password login
router.post('/login', (req, res) => {
    const { username, password, idtoken } = req.body;

    if (username && password) {
        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Database connection error:", err);
                return res.sendStatus(500);
            }

            const query = "SELECT * FROM users WHERE username = ?";
            connection.query(query, [username], (error, results) => {
                connection.release();

                if (error) {
                    console.error("Query error:", error);
                    return res.sendStatus(500);
                }

                if (results.length === 0) {
                    return res.status(401).render('login', { error: "Invalid username or password" });
                }

                const user = results[0];

                bcrypt.compare(password, user.password, (bcrypterr, isMatch) => {
                    if (bcrypterr) {
                        console.error("Bcrypt error:", bcrypterr);
                        return res.sendStatus(500);
                    }
                    if (!isMatch) {
                        return res.status(401).render('login', { error: "Invalid username or password" });
                    }
                    req.session.user = {
                        id: user.UserID,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        profile_picture: user.profile_picture || null
                    };
                    res.redirect('/');
                });
            });
        });
    }

    // Google login flow
    else if (idtoken) {
        client.verifyIdToken({
            idToken: idtoken,
            audience: CLIENT_ID
        }).then((ticket) => {
            const payload = ticket.getPayload();
            const googleId = payload.sub;
            const { email, name } = payload;

            req.pool.getConnection((err, connection) => {
                if (err) {
                    console.error("Database connection error:", err);
                    return res.sendStatus(500);
                }
                // Try to find user by google_id or email
                const query = "SELECT * FROM users WHERE google_id = ? OR email = ?";
                connection.query(query, [googleId, email], (error, results) => {
                    if (error) {
                        connection.release();
                        console.error("Query error:", error);
                        return res.sendStatus(500);
                    }
                    if (results.length > 0) {
                        // User exists, log them in
                        const user = results[0];
                        req.session.user = {
                            id: user.UserID,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            profile_picture: user.profile_picture || null
                        };
                        connection.release();
                        return res.sendStatus(200);
                    } else {
                        // Create new user
                        const insertQuery = "INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)";
                        connection.query(insertQuery, [name, email, googleId], (insertErr, insertResults) => {
                            connection.release();
                            if (insertErr) {
                                console.error("Insert error:", insertErr);
                                return res.sendStatus(500);
                            }
                            req.session.user = {
                                id: insertResults.insertId,
                                username: name,
                                email: email,
                                profile_picture: null
                            };
                            return res.sendStatus(200);
                        });
                    }
                });
            });
        }).catch((err) => {
            console.error("Google token error:", err);
            res.sendStatus(500);
        });
    }

    else {
        return res.status(400).send("Please provide login credentials");
    }
});

// Logout
router.post('/logout', function (req, res) {
    if (req.session.user !== undefined) {
        delete req.session.user;
    }
    res.sendStatus(200);
});