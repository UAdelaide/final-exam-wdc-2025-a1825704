var express = require('express');
var router = express.Router();

router.get('/api/dogs', function(req, res, next) {
const pool = req.pool;

try {
    pool.query('SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username FROM Dogs INNER JOIN Users ON Users.user_id = Dogs.owner_id', (err, results) => {
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
const pool = req.pool;

try {
    pool.query(`SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username FROM WalkRequests INNER JOIN Dogs ON Dogs.dog_id = WalkRequests.dog_id INNER JOIN Users ON Dogs.owner_id = Users.user_id WHERE status='open'`,
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
const pool = req.pool;

try {
    pool.query(``, (err, results) => {
        res.send(results);
    });
} catch (err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

module.exports = router;
