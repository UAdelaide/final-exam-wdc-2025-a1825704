var express = require('express');
var router = express.Router();
const db = require('../models/db');

router.get('/api/dogs', function(req, res, next) {

try {
    db.query('SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username FROM Dogs INNER JOIN Users ON Users.user_id = Dogs.owner_id', (err, results) => {
        if (err) {
            console.log('Error Fetching Dogs:', err);
            return res.status(500).send('Could not load dogs');
        }
        res.send(results);
    });
} catch(err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

router.get('/api/walkrequests/open', function(req, res, next) {

try {
    db.query(
        `SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username FROM WalkRequests INNER JOIN Dogs ON Dogs.dog_id = WalkRequests.dog_id INNER JOIN Users ON Dogs.owner_id = Users.user_id WHERE status='open'`,
        (err, results) => {
            if (err) {
                console.log('Error Fetching Open Walkers:', err);
                return res.status(500).send('Could not load walkers');
            }
            res.send(results);
        }
    );
} catch (err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

router.get('/api/walkers/summary', function(req, res, next) {

try {
    db.query(`
    SELECT Users.username AS walker_username, COUNT(WalkRatings.rating_id) AS total_ratings, COALESCE(ROUND(AVG(WalkRatings.rating), 2), 0) AS average_ratings,
    COUNT(DISTINCT CASE WHEN WalkRequests.status = 'completed' THEN WalkRequests.request_id END) AS completed_walks
    FROM Users
    LEFT JOIN WalkRatings ON WalkRatings.walker_id  = Users.user_id
    LEFT JOIN WalkApplications ON WalkApplications.walker_id = Users.user_id AND WalkApplications.status = 'accepted'
    LEFT JOIN WalkRequests ON WalkRequests.request_id = WalkApplications.request_id
    WHERE  Users.role = 'walker'
    GROUP BY Users.user_id, Users.username
    ORDER BY Users.username`, (err, results) => {
        if (err) {
            console.log('Error Fetching Walkers:', err);
            return res.status(500).send('Could not load walkers');
        }
        res.send(results);
    });
} catch (err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

module.exports = router;
