var express = require('express');
var router = express.Router();

// Standard username/password login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        req.pool.getConnection((err, connection) => {
            if (err) {
                console.error("Database connection error:", err);
                return res.sendStatus(500);
            }

            const query = "SELECT * FROM Users WHERE username = ?";
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

                    if (password !== user.password) {
                        return res.status(401).render('login', { error: "Invalid username or password" });
                    }
                    req.session.user = {
                        id: user.uers_id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                    if(user.role === 'owner')
                    res.redirect('/');
            });
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
    res.redirect;
});
